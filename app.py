from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from flask_cors import CORS
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from flask_restful import Api, Resource
from flask_validator import Validator
from marshmallow import Schema, fields, validate
from datetime import datetime
import bcrypt
import os
from dotenv import load_dotenv
from bson import ObjectId
from cerberus import Validator as CerberusValidator
from werkzeug.exceptions import HTTPException
import logging

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)
api = Api(app)

# Configuration
app.config['MONGO_URI'] = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/financial-tracker')
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'your-secret-key')
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 3600  # 1 hour

# Initialize extensions
mongo = PyMongo(app)
jwt = JWTManager(app)

# Error Handlers
@app.errorhandler(HTTPException)
def handle_http_error(error):
    response = {
        'error': error.name,
        'message': error.description
    }
    return jsonify(response), error.code

@app.errorhandler(Exception)
def handle_error(error):
    logger.error(f"An error occurred: {str(error)}")
    response = {
        'error': 'Internal Server Error',
        'message': 'An unexpected error occurred'
    }
    return jsonify(response), 500

# Validation Schemas
class UserSchema(Schema):
    username = fields.Str(required=True, validate=validate.Length(min=3, max=50))
    password = fields.Str(required=True, validate=validate.Length(min=6))

class FinancialRecordSchema(Schema):
    date = fields.Date(required=True)
    monthly_income = fields.Float(required=True, validate=validate.Range(min=0))
    rent = fields.Float(required=True, validate=validate.Range(min=0))
    other_expenses = fields.Float(required=True, validate=validate.Range(min=0))
    room_expenses = fields.Float(required=True, validate=validate.Range(min=0))
    sip_amount = fields.Float(required=True, validate=validate.Range(min=0))

class ExpenseSchema(Schema):
    date = fields.Date(required=True)
    amount = fields.Float(required=True, validate=validate.Range(min=0))
    type = fields.Str(required=True, validate=validate.OneOf(['delayed', 'room']))

class TransactionSchema(Schema):
    type = fields.Str(required=True, validate=validate.OneOf(['given', 'taken']))
    person_name = fields.Str(required=True, validate=validate.Length(min=2))
    date = fields.Date(required=True)
    amount = fields.Float(required=True, validate=validate.Range(min=0))
    recovery_date = fields.Date(required=True)
    status = fields.Str(required=True, validate=validate.OneOf(['pending', 'completed']))

# MongoDB Indexes
def create_indexes():
    mongo.db.users.create_index('username', unique=True)
    mongo.db.financial_records.create_index([('user_id', 1), ('date', -1)])
    mongo.db.expenses.create_index([('user_id', 1), ('date', -1)])
    mongo.db.transactions.create_index([('user_id', 1), ('date', -1)])

# API Resources
class UserRegistration(Resource):
    def post(self):
        try:
            data = request.get_json()
            schema = UserSchema()
            errors = schema.validate(data)
            
            if errors:
                return {'error': 'Validation Error', 'details': errors}, 400

            if mongo.db.users.find_one({'username': data['username']}):
                return {'error': 'Username already exists'}, 400

            hashed_password = bcrypt.hashpw(data['password'].encode('utf-8'), bcrypt.gensalt())
            user = {
                'username': data['username'],
                'password': hashed_password.decode('utf-8')
            }
            mongo.db.users.insert_one(user)

            return {'message': 'User created successfully'}, 201
        except Exception as e:
            logger.error(f"Registration error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

class UserLogin(Resource):
    def post(self):
        try:
            data = request.get_json()
            schema = UserSchema()
            errors = schema.validate(data)
            
            if errors:
                return {'error': 'Validation Error', 'details': errors}, 400

            user = mongo.db.users.find_one({'username': data['username']})
            if not user or not bcrypt.checkpw(data['password'].encode('utf-8'), user['password'].encode('utf-8')):
                return {'error': 'Invalid username or password'}, 401

            access_token = create_access_token(identity=str(user['_id']))
            return {'token': access_token}, 200
        except Exception as e:
            logger.error(f"Login error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

class FinancialRecordResource(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            records = list(mongo.db.financial_records.find({'user_id': user_id}))
            for record in records:
                record['_id'] = str(record['_id'])
                record['date'] = record['date'].strftime('%Y-%m-%d')
            return records, 200
        except Exception as e:
            logger.error(f"Get records error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

    @jwt_required()
    def post(self):
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            schema = FinancialRecordSchema()
            errors = schema.validate(data)
            
            if errors:
                return {'error': 'Validation Error', 'details': errors}, 400

            record = {
                'user_id': user_id,
                'date': datetime.strptime(data['date'], '%Y-%m-%d'),
                'monthly_income': data['monthlyIncome'],
                'rent': data['rent'],
                'other_expenses': data['otherExpenses'],
                'room_expenses': data['roomExpenses'],
                'sip_amount': data['sipAmount']
            }
            mongo.db.financial_records.insert_one(record)
            return {'message': 'Record created successfully'}, 201
        except Exception as e:
            logger.error(f"Create record error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

class ExpenseResource(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            expenses = list(mongo.db.expenses.find({'user_id': user_id}))
            for expense in expenses:
                expense['_id'] = str(expense['_id'])
                expense['date'] = expense['date'].strftime('%Y-%m-%d')
            return expenses, 200
        except Exception as e:
            logger.error(f"Get expenses error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

    @jwt_required()
    def post(self):
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            schema = ExpenseSchema()
            errors = schema.validate(data)
            
            if errors:
                return {'error': 'Validation Error', 'details': errors}, 400

            expense = {
                'user_id': user_id,
                'date': datetime.strptime(data['date'], '%Y-%m-%d'),
                'amount': data['amount'],
                'type': data['type']
            }
            mongo.db.expenses.insert_one(expense)
            return {'message': 'Expense created successfully'}, 201
        except Exception as e:
            logger.error(f"Create expense error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

class TransactionResource(Resource):
    @jwt_required()
    def get(self):
        try:
            user_id = get_jwt_identity()
            transactions = list(mongo.db.transactions.find({'user_id': user_id}))
            for transaction in transactions:
                transaction['_id'] = str(transaction['_id'])
                transaction['date'] = transaction['date'].strftime('%Y-%m-%d')
                transaction['recovery_date'] = transaction['recovery_date'].strftime('%Y-%m-%d')
            return transactions, 200
        except Exception as e:
            logger.error(f"Get transactions error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

    @jwt_required()
    def post(self):
        try:
            user_id = get_jwt_identity()
            data = request.get_json()
            schema = TransactionSchema()
            errors = schema.validate(data)
            
            if errors:
                return {'error': 'Validation Error', 'details': errors}, 400

            transaction = {
                'user_id': user_id,
                'type': data['type'],
                'person_name': data['personName'],
                'date': datetime.strptime(data['date'], '%Y-%m-%d'),
                'amount': data['amount'],
                'recovery_date': datetime.strptime(data['recoveryDate'], '%Y-%m-%d'),
                'status': data['status']
            }
            mongo.db.transactions.insert_one(transaction)
            return {'message': 'Transaction created successfully'}, 201
        except Exception as e:
            logger.error(f"Create transaction error: {str(e)}")
            return {'error': 'Internal Server Error'}, 500

# Register API resources
api.add_resource(UserRegistration, '/api/register')
api.add_resource(UserLogin, '/api/login')
api.add_resource(FinancialRecordResource, '/api/records')
api.add_resource(ExpenseResource, '/api/expenses')
api.add_resource(TransactionResource, '/api/transactions')

# Create indexes
with app.app_context():
    create_indexes()

if __name__ == '__main__':
    app.run(debug=True) 
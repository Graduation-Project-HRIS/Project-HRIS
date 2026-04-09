# def is_valid_id(user_id):
#     return len(user_id) == 7 and user_id.isdigit()

# # Example usage in your login function:
# @app.route('/login', methods=['POST'])
# def login():
#     data = request.get_json()
#     user_id = data.get('username')  # Assuming 'username' is the ID field
    
#     if not is_valid_id(user_id):
#         return jsonify({'error': 'ID must be exactly 7 digits'}), 400
    
#     # Rest of your login logic...
import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Find users by username
    Args: event with httpMethod, queryStringParameters; context with request_id
    Returns: HTTP response with user data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'GET':
        import psycopg2
        import psycopg2.extras
        
        params = event.get('queryStringParameters', {})
        username = params.get('username', '').strip()
        
        if not username:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'username required'})
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
        
        try:
            cur.execute(
                "SELECT id, username, nickname, avatar_url FROM users WHERE username = %s",
                (username,)
            )
            user = cur.fetchone()
            
            if user:
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({
                        'user': {
                            'id': user['id'],
                            'username': user['username'],
                            'nickname': user['nickname'],
                            'avatar_url': user['avatar_url']
                        }
                    })
                }
            else:
                return {
                    'statusCode': 404,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'User not found'})
                }
        finally:
            cur.close()
            conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

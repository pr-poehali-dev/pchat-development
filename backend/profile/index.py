import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Update user profile - nickname, avatar, settings
    Args: event with httpMethod, body; context with request_id
    Returns: HTTP response with update result
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'PUT, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method == 'PUT':
        import psycopg2
        
        body_data = json.loads(event.get('body', '{}'))
        user_id = body_data.get('user_id')
        nickname = body_data.get('nickname')
        avatar_url = body_data.get('avatar_url')
        hide_online_status = body_data.get('hide_online_status')
        theme = body_data.get('theme')
        
        if not user_id:
            return {
                'statusCode': 400,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'error': 'user_id required'})
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        try:
            updates = []
            params = []
            
            if nickname is not None:
                updates.append('nickname = %s')
                params.append(nickname)
            
            if avatar_url is not None:
                updates.append('avatar_url = %s')
                params.append(avatar_url)
            
            if hide_online_status is not None:
                updates.append('hide_online_status = %s')
                params.append(hide_online_status)
            
            if theme is not None:
                updates.append('theme = %s')
                params.append(theme)
            
            if updates:
                params.append(user_id)
                query = f"UPDATE users SET {', '.join(updates)}, updated_at = CURRENT_TIMESTAMP WHERE id = %s"
                cur.execute(query, tuple(params))
                conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        finally:
            cur.close()
            conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'})
    }

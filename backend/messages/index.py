import json
import os
from typing import Dict, Any
from datetime import datetime

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Handle chat messages - send, receive, mark as read
    Args: event with httpMethod, body, queryStringParameters; context with request_id
    Returns: HTTP response with messages data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-User-Id',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    import psycopg2
    import psycopg2.extras
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {})
            chat_id = params.get('chat_id')
            user_id = params.get('user_id')
            
            if not chat_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'chat_id required'})
                }
            
            cur.execute("""
                SELECT m.id, m.chat_id, m.sender_id, m.content, m.message_type, 
                       m.file_url, m.is_system, m.read_by, m.created_at,
                       u.username, u.nickname, u.avatar_url
                FROM messages m
                LEFT JOIN users u ON m.sender_id = u.id
                WHERE m.chat_id = %s
                ORDER BY m.created_at ASC
            """, (chat_id,))
            
            messages = cur.fetchall()
            messages_list = []
            
            for msg in messages:
                messages_list.append({
                    'id': msg['id'],
                    'chat_id': msg['chat_id'],
                    'sender_id': msg['sender_id'],
                    'content': msg['content'],
                    'message_type': msg['message_type'],
                    'file_url': msg['file_url'],
                    'is_system': msg['is_system'],
                    'read_by': msg['read_by'] or [],
                    'created_at': msg['created_at'].isoformat() if msg['created_at'] else None,
                    'sender': {
                        'username': msg['username'],
                        'nickname': msg['nickname'],
                        'avatar_url': msg['avatar_url']
                    }
                })
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'messages': messages_list})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            chat_id = body_data.get('chat_id')
            sender_id = body_data.get('sender_id')
            content = body_data.get('content', '').strip()
            message_type = body_data.get('message_type', 'text')
            file_url = body_data.get('file_url')
            is_system = body_data.get('is_system', False)
            
            if not chat_id or not sender_id or not content:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'chat_id, sender_id and content required'})
                }
            
            cur.execute("""
                INSERT INTO messages (chat_id, sender_id, content, message_type, file_url, is_system)
                VALUES (%s, %s, %s, %s, %s, %s)
                RETURNING id, created_at
            """, (chat_id, sender_id, content, message_type, file_url, is_system))
            
            result = cur.fetchone()
            
            cur.execute("UPDATE chats SET updated_at = CURRENT_TIMESTAMP WHERE id = %s", (chat_id,))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'message': {
                        'id': result['id'],
                        'created_at': result['created_at'].isoformat()
                    }
                })
            }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            message_id = body_data.get('message_id')
            user_id = body_data.get('user_id')
            
            if not message_id or not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'message_id and user_id required'})
                }
            
            cur.execute("""
                UPDATE messages 
                SET read_by = array_append(read_by, %s)
                WHERE id = %s AND NOT (%s = ANY(read_by))
            """, (user_id, message_id, user_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'success': True})
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()

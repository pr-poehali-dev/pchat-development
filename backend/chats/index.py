import json
import os
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Manage chats - create, list, get members
    Args: event with httpMethod, body, queryStringParameters; context with request_id
    Returns: HTTP response with chats data
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
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
            user_id = params.get('user_id')
            
            if not user_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'user_id required'})
                }
            
            cur.execute("""
                SELECT DISTINCT c.id, c.type, c.name, c.avatar_url, c.owner_id, c.updated_at,
                       (SELECT content FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
                       (SELECT created_at FROM messages WHERE chat_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message_time
                FROM chats c
                INNER JOIN chat_members cm ON c.id = cm.chat_id
                WHERE cm.user_id = %s
                ORDER BY c.updated_at DESC
            """, (user_id,))
            
            chats = cur.fetchall()
            chats_list = []
            
            for chat in chats:
                chat_data = {
                    'id': chat['id'],
                    'type': chat['type'],
                    'name': chat['name'],
                    'avatar_url': chat['avatar_url'],
                    'owner_id': chat['owner_id'],
                    'last_message': chat['last_message'],
                    'last_message_time': chat['last_message_time'].isoformat() if chat['last_message_time'] else None
                }
                
                if chat['type'] == 'private':
                    cur.execute("""
                        SELECT u.id, u.username, u.nickname, u.avatar_url
                        FROM users u
                        INNER JOIN chat_members cm ON u.id = cm.user_id
                        WHERE cm.chat_id = %s AND u.id != %s
                        LIMIT 1
                    """, (chat['id'], user_id))
                    other_user = cur.fetchone()
                    if other_user:
                        chat_data['other_user'] = {
                            'id': other_user['id'],
                            'username': other_user['username'],
                            'nickname': other_user['nickname'],
                            'avatar_url': other_user['avatar_url']
                        }
                
                chats_list.append(chat_data)
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({'chats': chats_list})
            }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            chat_type = body_data.get('type')
            creator_id = body_data.get('creator_id')
            name = body_data.get('name')
            avatar_url = body_data.get('avatar_url')
            member_ids = body_data.get('member_ids', [])
            
            if not chat_type or not creator_id:
                return {
                    'statusCode': 400,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'error': 'type and creator_id required'})
                }
            
            owner_id = creator_id if chat_type == 'group' else None
            
            cur.execute("""
                INSERT INTO chats (type, name, avatar_url, owner_id)
                VALUES (%s, %s, %s, %s)
                RETURNING id
            """, (chat_type, name, avatar_url, owner_id))
            
            chat_id = cur.fetchone()['id']
            
            all_member_ids = [creator_id] + [mid for mid in member_ids if mid != creator_id]
            
            for member_id in all_member_ids:
                cur.execute("""
                    INSERT INTO chat_members (chat_id, user_id)
                    VALUES (%s, %s)
                """, (chat_id, member_id))
            
            conn.commit()
            
            return {
                'statusCode': 200,
                'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                'body': json.dumps({
                    'success': True,
                    'chat_id': chat_id
                })
            }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    finally:
        cur.close()
        conn.close()

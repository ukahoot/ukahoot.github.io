#pragma once

#define KAHOOT_SSL_PORT 443
#define KAHOOT_HOST_URI "kahoot.it"

#define RES_403_FAIL "HTTP/1.1 403 FORBIDDEN\r\n\
Access-Control-Allow-Origin: *\r\n\
Content-Type: application/json\r\n\
Server: ukahoot_token_server\r\n\
Keep-Alive: timeout=15,max=100\r\n\
\r\n"
#define RES_403_FAIL_LEN 152

#define RES_SUCCESS_HEADERS "HTTP/1.1 200 OK\r\n\
Access-Control-Allow-Origin: *\r\n\
Content-Type: application/json\r\n\
Server: ukahoot-token-server\r\n\
Keep-Alive: timeout=15,max=100\r\n\
\r\n"
#define RES_SUCCESS_HEADERS_LEN 166

#define RES_JSON_HEADERS "HTTP/1.1 200 OK\r\n\
Access-Control-Allow-Origin: *\r\n\
Content-Type: application/json\r\n\
Server: ukahoot-token-server\r\n\
Keep-Alive: timeout=15,max=100\r\n\
Content-Length: " // Purposely unfinished so more can be appended

#define RES_FAIL_REQUEST "HTTP/1.1 200 OK\r\n\
Access-Control-Allow-Origin: *\r\n\
Content-Type: application/json\r\n\
Server: ukahoot-token-server\r\n\
Keep-Alive: timeout=15,max=100\r\n\
Content-Length: 39\r\n\
\r\n\
{\"error\": \"true\",\
\"responseCode\": \"404\"}"
#define RES_FAIL_LEN 205

#define KAHOOT_SESSION_HEADER "x-kahoot-session-token:"
#define SESSION_HEADER_LEN 24 // One character larger than the header because of the space between the header and value
#define MAX_BODY_SIZE 500 // Roughly the largest length of a Kahoot token response

#define KAHOOT_RES_START "{\"twoFactorAuth\":"
#define KAHOOT_RES_START_LEN 17

#define OFFSET_LOG " console.log(\"Offset derived as:\", offset);"

static const char* KAHOOT_TOKEN_GET = "GET /reserve/session/";
static int KAHOOT_GET_LEN = 22;
static const char* KAHOOT_TOKEN_HEADERS = " HTTP/1.1\r\n\
Host: kahoot.it\r\n\
Connection: keep-alive\r\n\
Accept: application/json, text/plain, */*\r\n\
User-Agent: ukahoot-token-server\r\n\
Referer: https://kahoot.it/\r\n\
Accept-Language: en-US,en;q=0.8\r\n\
\r\n";
static const int KAHOOT_HEADERS_SIZE = 191;

char* get_req_headers(char*);
char* get_pid_query(char*);
char* get_header_token(char*);
char* get_response_body(char*);
char* get_json_response(char*, char*);
// For creating a full HTTP response with headers
char* __get_http_response(char*);
char* get_http_response(char*, char*);
#include <stdio.h>
#include <stdlib.h>
#include <unistd.h>
#include <string.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <netinet/in.h>
#include <netdb.h>
#include <pthread.h>
#include <errno.h>

#include "kahoot.h"

typedef struct {
    pthread_t tid;
    int portno;
    int sockfd;
    int backl;
    struct sockaddr_in addr;
    int running;
} httpserv;

typedef struct {
    socklen_t len;
    struct sockaddr_in addr;
    int fd;
    pthread_t tid;
} httpcli;

int httpcli_write_str(httpcli* h, char* str) {
    return write(h->fd, str, strlen(str));
};
int httpcli_write(httpcli* h, char* buffer, int len) {
    return write(h->fd, buffer, len);
};
int httpcli_read(httpcli* h, char* buffer, int len) {
    return read(h->fd, buffer, len);
};
void* http_handle_client(void* vargp) {
    httpcli* cli = (httpcli*) vargp;
    char* cli_req = malloc(512); // TODO: Make SURE this is free'd
    int e; // For read/write return values
    e = read(cli->fd, cli_req, 511);
    if (e < 0) {
        // Read error, destroy and close socket
        printf("%s%s%s\n", "Client read error: ",
                strerror(errno), ". Closing socket.");
        close(cli->fd);
        free(cli);
        free(cli_req);
    } else {
        // Safe to write
        char* pid = get_pid_query(cli_req);
        if (pid == NULL) {
            // Invalid request
            printf("%s\n", "Rejected invalid request");
            e = httpcli_write(cli, RES_FAIL, RES_FAIL_LEN);
            close(cli->fd);
            free(cli);
            free(cli_req);
        } else {
            // Valid request
            // TODO: handle valid requests
        }
    }
};

httpserv* http_init_server(int port, int backlog) {
    httpserv* server = malloc(sizeof(httpserv)); // Create HTTP server structure
    server->running = 1;
    server->backl = backlog;
    server->sockfd = socket(AF_INET, SOCK_STREAM, 0);
    server->addr.sin_family = AF_INET;
    server->addr.sin_addr.s_addr = INADDR_ANY;
    
    server->addr.sin_port = htons(port);
    server->portno = port;
    int e = bind(server->sockfd,
        (struct sockaddr *) &server->addr,
         sizeof(server->addr));
    if (e < 0) {
        printf("%s%s\n", "Bind error: ", strerror(errno));
        exit(1);
    }
    return server;
};
void* http_listen_thread(void* vargp) {
    httpserv* h = (httpserv*)vargp; // Cast the argument to an httpserv
    listen(h->sockfd, h->backl);
    while (h->running) {
        httpcli* cli = malloc(sizeof(httpcli)); // TODO: Make SURE this is free'd
        cli->len = sizeof(cli->addr);
        cli->fd = accept(h->sockfd, 
                        (struct sockaddr*) &cli->addr,
                        &cli->len);
        if (cli->fd < 0) {
            // Error accepting the socket
            printf("%s%s\n", "Client accept error: ", strerror(errno));
            free(cli);
        } else {
            // Socket accepted successfully
            pthread_create(&cli->tid, NULL, http_handle_client, cli);
            pthread_join(cli->tid, NULL);
        }
    }
    free(h); // Destroy the server after the accept loop is over
};
void http_server_listen(httpserv* server) {
    pthread_create(&server->tid, NULL, http_listen_thread, server);
    pthread_join(server->tid, NULL);
};
void http_server_stop(httpserv* h) {
    h->running = 0;
}
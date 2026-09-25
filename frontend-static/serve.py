import http.server
import socketserver
import os
import webbrowser

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)


def run_server():
    print(f"Starting Reviewr Feedback Intelligence Prototype at http://localhost:{PORT}")
    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving files from {DIRECTORY}")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nShutting down server.")


if __name__ == "__main__":
    run_server()

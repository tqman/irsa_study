#!/usr/bin/env python3
"""
Simple HTTPS server for local development.

Automatically generates a self-signed certificate if one doesn't exist,
then serves the current directory over HTTPS on port 4443.

Usage:
    python3 https_server.py
"""
import http.server
import ssl
import subprocess
import os
import sys

CERT_FILE = 'cert.pem'
KEY_FILE = 'key.pem'
PORT = 4443

def generate_certificate():
    """Generate a self-signed SSL certificate for localhost."""
    print("Generating self-signed certificate for localhost...")
    try:
        subprocess.run([
            'openssl', 'req', '-x509', '-newkey', 'rsa:4096',
            '-keyout', KEY_FILE, '-out', CERT_FILE,
            '-days', '365', '-nodes', '-subj', '/CN=localhost'
        ], check=True, capture_output=True)
        print(f"✓ Certificate generated: {CERT_FILE} and {KEY_FILE}")
    except subprocess.CalledProcessError as e:
        print(f"✗ Failed to generate certificate: {e.stderr.decode()}", file=sys.stderr)
        sys.exit(1)
    except FileNotFoundError:
        print("✗ Error: openssl not found. Please install OpenSSL.", file=sys.stderr)
        sys.exit(1)

def main():
    # Check if certificate exists, generate if not
    if not os.path.exists(CERT_FILE) or not os.path.exists(KEY_FILE):
        generate_certificate()
    else:
        print(f"Using existing certificate: {CERT_FILE}")

    # Create and configure server
    server_address = ('localhost', PORT)
    httpd = http.server.HTTPServer(server_address, http.server.SimpleHTTPRequestHandler)

    # Create SSL context
    ssl_context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
    ssl_context.load_cert_chain(CERT_FILE, KEY_FILE)
    httpd.socket = ssl_context.wrap_socket(httpd.socket, server_side=True)

    print(f"\n🔒 Serving HTTPS on https://localhost:{PORT}")
    print("   Press Ctrl+C to stop\n")
    print("Note: Your browser will warn about the self-signed certificate.")
    print("      Click 'Advanced' and proceed to localhost.\n")

    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n\nServer stopped.")
        sys.exit(0)

if __name__ == '__main__':
    main()

# Recebe POST /<nome> com texto e salva em leis/<nome>.txt (só nomes simples)
import http.server, re, os
DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'leis')  # nazza-estudos/leis
class H(http.server.BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200); self.send_header('Content-Type','text/html'); self.end_headers(); self.wfile.write(b'ok')
    def do_POST(self):
        nome = self.path.strip('/')
        if not re.fullmatch(r'[a-z0-9]+', nome): self.send_response(400); self.end_headers(); return
        dados = self.rfile.read(int(self.headers['Content-Length']))
        open(os.path.join(DIR, nome + '.txt'), 'wb').write(dados)
        self.send_response(200); self.end_headers(); self.wfile.write(str(len(dados)).encode())
http.server.HTTPServer(('127.0.0.1', 8765), H).serve_forever()

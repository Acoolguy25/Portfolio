from flask import Flask
import flask

app = Flask(__name__, template_folder="htmls/")

@app.route('/')
def home():
    return flask.render_template("index.html")

@app.route('/<name>')
def hello(name=None):
    return flask.render_template(f"{name}.html")

app.run()
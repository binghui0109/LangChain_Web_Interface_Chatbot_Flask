# LangChain_Web_interface_Chatbot_Flask

The project use Python to call the OpenAI API and then pass the API's output with Flask into a web interface created with JavaScript, HTML, and CSS. This allows you to build a user-friendly web application chatbot.

## Installation

Install [Langchain](https://github.com/hwchase17/langchain) and other required packages.
```
pip install langchain openai chromadb tiktoken unstructured flask
```
Modify `Your OpenAI API key` inside `constants.py` to use your own [OpenAI API key](https://platform.openai.com/account/api-keys).

Place your own data into `data/data.txt`.

## Usage
Modify the `system_template` inside `my_flask.py` based on your own need.

Run the script using command `python my_flask.py`.

Enter local server `Running on http://127.0.0.1:5000` to access.




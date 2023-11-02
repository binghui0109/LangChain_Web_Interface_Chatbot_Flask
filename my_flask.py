from flask import Flask, request, jsonify,render_template
import os
import sys
from langchain.prompts import ChatPromptTemplate
from langchain.prompts.chat import SystemMessagePromptTemplate, HumanMessagePromptTemplate
import openai
from langchain.chains import ConversationalRetrievalChain, RetrievalQA
from langchain.chat_models import ChatOpenAI
from langchain.document_loaders import DirectoryLoader, TextLoader
from langchain.embeddings import OpenAIEmbeddings
from langchain.indexes import VectorstoreIndexCreator
from langchain.indexes.vectorstore import VectorStoreIndexWrapper
from langchain.llms import OpenAI
from langchain.vectorstores import Chroma
from flask_cors import CORS
os.environ["OPENAI_API_KEY"] = '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'
app = Flask(__name__, static_url_path='/static')
PERSIST = True

system_template = """ Please provided assistance based on the context below.
----------------
{context}
---------------"""

messages = [
SystemMessagePromptTemplate.from_template(system_template),
HumanMessagePromptTemplate.from_template("Question:```{question}```")
]
qa_prompt = ChatPromptTemplate.from_messages(messages)
query = None
if len(sys.argv) > 1:
    query = sys.argv[1]

if PERSIST and os.path.exists("persist"):
    print("Reusing index...\n")
    vectorstore = Chroma(persist_directory="persist", embedding_function=OpenAIEmbeddings())
    index = VectorStoreIndexWrapper(vectorstore=vectorstore)
else:   
    # loader = TextLoader("data/data.txt") # Use this line if you only need data.txt
    loader = DirectoryLoader("data/")
    if PERSIST:
        #   index = VectorstoreIndexCreator(vectorstore_kwargs={"persist_directory": "persist"},text_splitter=CharacterTextSplitter(chunk_size=2500, chunk_overlap=500)).from_loaders([loader])
        index = VectorstoreIndexCreator(vectorstore_kwargs={"persist_directory": "persist"}).from_loaders([loader])
    else:
        index = VectorstoreIndexCreator().from_loaders([loader])

chain = ConversationalRetrievalChain.from_llm(
    llm=ChatOpenAI(model="gpt-3.5-turbo-16k"),
    # llm=ChatOpenAI(model="gpt-4"),
    retriever=index.vectorstore.as_retriever(search_kwargs={"k": 5}),
    return_source_documents=True,combine_docs_chain_kwargs={"prompt": qa_prompt}
)
chat_history = []

@app.route("/chatbot", methods=["POST"])
def chatbot_endpoint():
    user_message = request.json['user_message']

    if user_message.lower() in ['quit', 'q', 'exit']:
        sys.exit()
    response = chat_with_bot(user_message)  # Create a function to handle chat interactions
    return jsonify({"bot_response": response})

@app.route('/')
def chatbot_page():
    return render_template('index.html')

def chat_with_bot(user_message):
    result = chain({"question": user_message, "chat_history": chat_history})
    # print(f'question:{user_message}')
    print(f'result:{result}')
    # print(f'{chat_history}')
    chat_history.append((user_message, result['answer']))
    return result['answer']

if __name__ == '__main__':
    app.run(debug=True)
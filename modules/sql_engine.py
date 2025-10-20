from langchain_core.output_parsers import StrOutputParser
from langchain_core.prompts import ChatPromptTemplate
from dotenv import load_dotenv
load_dotenv()



def json_to_sql(json_response):
    # Estrai i dati JSON
    problema = json_response.get('summary')
    oggetto = json_response.get('equipment')
    dove = json_response.get('address')
    confidence = json_response.get('confidence')
    # Crea la stringa SQL
    sql_string = f"INSERT INTO (problema, oggetto, dove, confidenza) VALUES ('{problema}', '{oggetto}', '{dove}', '{confidence}')"
    return sql_string
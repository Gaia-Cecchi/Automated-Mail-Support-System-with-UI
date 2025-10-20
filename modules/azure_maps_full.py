import requests

# Import timeout configuration
try:
    from config import Config
    REQUEST_TIMEOUT = Config.REQUEST_TIMEOUT
except ImportError:
    REQUEST_TIMEOUT = 10  # Default timeout

def get_location_details(address, subscription_key):
    # Funzione di geocodifica
    def geocode_address(address, subscription_key):
        url = f"https://atlas.microsoft.com/search/address/json"
        params = {
            'api-version': '1.0',
            'query': address,
            'subscription-key': subscription_key
        }
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            if data['results']:
                return data['results'][0]['position']
            else:
                return None
        else:
            return None

    # Funzione di reverse geocodifica
    def reverse_geocode(lat, lon, subscription_key):
        url = f"https://atlas.microsoft.com/search/address/reverse/json"
        params = {
            'api-version': '1.0',
            'query': f'{lat},{lon}',
            'subscription-key': subscription_key
        }
        response = requests.get(url, params=params, timeout=REQUEST_TIMEOUT)
        if response.status_code == 200:
            data = response.json()
            if data['addresses']:
                return data['addresses'][0]['address']
            else:
                return None
        else:
            return None

    # Funzione di classificazione della regione
    def classify_region(region):
        nord = ["Lombardia", "Piemonte", "Veneto", "Liguria", "Friuli Venezia Giulia", "Trentino Alto Adige", "Valle d'Aosta"]
        centro = ["Toscana", "Umbria", "Lazio", "Emilia Romagna"]
        sud = ["Marche", "Abruzzo", "Campania", "Puglia", "Basilicata", "Calabria", "Sicilia", "Sardegna", "Molise"]
        
        if region in nord:
            return "Nord"
        elif region in centro:
            return "Centro"
        elif region in sud:
            return "Sud"
        else:
            return "Unknown"

    # Geocoding: ottenere latitudine e longitudine
    location = geocode_address(address, subscription_key)
    if location:
        lat = location['lat']
        lon = location['lon']
        
        # Reverse Geocoding: ottenere indirizzo completo
        address_details = reverse_geocode(lat, lon, subscription_key)
        if address_details:
            comune = address_details.get('municipality', 'N/A')
            provincia = address_details.get('countrySecondarySubdivision', 'N/A')
            regione = address_details.get('countrySubdivision', 'N/A')
            macro_area = classify_region(regione)
            return {
                "comune": comune,
                "provincia": provincia,
                "regione": regione,
                "macro_area": macro_area
            }
        else:
            return {"error": "Indirizzo completo non trovato"}
    else:
        return {"error": "Indirizzo non trovato"}

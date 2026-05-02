from pymongo import MongoClient
import certifi

# The MongoDB Atlas Connection String
# We use certifi to prevent SSL issues on Windows when connecting to Atlas
MONGO_URI = "mongodb+srv://admin:mikita1234@cluster0.dxp6g.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

class MockCollection:
    def find(self, query):
        return [
            {
                "_id": "mock1",
                "Name": "Gr. 20 Concrete",
                "Category": "Structural",
                "Rate_LKR": 36750.0,
                "Strength_N_mm2": 20.0,
                "Ductility": 1.5,
                "Embodied_Carbon": 0.15
            },
            {
                "_id": "mock2",
                "Name": "Timber (Teak)",
                "Category": "Structural",
                "Rate_LKR": 132000.0,
                "Strength_N_mm2": 15.0,
                "Ductility": 3.0,
                "Embodied_Carbon": 0.05
            },
            {
                "_id": "mock3",
                "Name": "Steel (High Yield)",
                "Category": "Structural",
                "Rate_LKR": 387600.0,
                "Strength_N_mm2": 460.0,
                "Ductility": 5.0,
                "Embodied_Carbon": 1.85
            },
            {
                "_id": "mock4",
                "Name": "8' Solid Blocks SLS 855",
                "Category": "Walls",
                "Rate_LKR": 4500.0,
                "Strength_N_mm2": 5.0,
                "Ductility": 1.1,
                "Embodied_Carbon": 0.12
            }
        ]

# Bypass MongoDB connection timeout by using the MockCollection
materials_collection = MockCollection()

def format_material(doc):
    """Formats a MongoDB document into the flat dictionary the frontend expects."""
    return {
        'MaterialID': str(doc['_id']),
        'Name': doc.get('Name', ''),
        'Category': doc.get('Category', ''),
        'Rate_LKR': doc.get('Rate_LKR', 0.0),
        'Strength_N_mm2': doc.get('Strength_N_mm2', 0.0),
        'Ductility': doc.get('Ductility', 0.0),
        'Embodied_Carbon': doc.get('Embodied_Carbon', 0.0)
    }

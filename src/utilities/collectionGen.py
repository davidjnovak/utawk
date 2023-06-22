import csv
import json

def generate_json(csv_file):
    json_list = []
    
    with open(csv_file, 'r') as file:
        reader = csv.DictReader(file)
        
        for row in reader:
            population = int(row['population'])
            
            if population > 13000:
                display_name = row['city']
                latitude = float(row['lat'])
                longitude = float(row['lng'])
                city_state_id = row['city'].replace(' ', '_') + '_' + row['state_id']
                
                json_obj = {
                    'displayName': display_name,
                    'latitude': latitude,
                    'longitude': longitude,
                    'id': city_state_id
                }
                
                json_list.append(json_obj)
    
    return json_list

def save_as_json(data, output_file):
    with open(output_file, 'w') as file:
        json.dump(data, file, indent=4)

# Example usage
csv_file_path = 'uscities.csv'
json_data = generate_json(csv_file_path)
output_file_path = 'collections.json'
save_as_json(json_data, output_file_path)

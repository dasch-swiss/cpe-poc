import json
import jsonschema
from jsonschema import validate
from pprint import pprint
import tkinter as tk
from tkinter import filedialog
from os.path import dirname
def validateJson(data, schema):
    try:
        validate(instance=data, schema=schema)
    except jsonschema.exceptions.ValidationError as err:
        print(err)
        return False
    return True

root = tk.Tk()
root.withdraw()
file_path = filedialog.askopenfilename()

with open("cpe.schema.json") as schema_file:

    schema = json.load(schema_file)

    with open(file_path) as json_file:
        data = json.load(json_file)
        isValid = validateJson(data, schema)
        if isValid:
            print("Given JSON data is Valid")
        else:
            print(data)
            print("Given JSON data is InValid")

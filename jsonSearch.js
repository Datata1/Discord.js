function searchInJSON(jsonData, searchString) {
  for (const key in jsonData) {
    if (typeof jsonData[key] === 'object') {
      // Wenn der Wert ein Objekt ist, rufe die Funktion rekursiv auf
      if (searchInJSON(jsonData[key], searchString)) {
        return true; // String wurde gefunden, breche die Suche ab
      }
    } else if (typeof jsonData[key] === 'string' && jsonData[key].includes(searchString)) {
      return true; // String wurde gefunden
    }
  }
  return false; // String wurde nicht gefunden
}

function searchInNestedJSON(jsonData, searchStrings) {
  let found = false;

  for (const key in jsonData) {
    if (typeof jsonData[key] === 'object') {
      found = searchInNestedJSON(jsonData[key], searchStrings) || found;
    } else if (typeof jsonData[key] === 'string' && searchStrings.some(searchString => jsonData[key].includes(searchString))) {
      found = true;
    }
  }
  return found;
}



async function loadChannelUsers() {
  try {
    const data = await fs.readFile('./team.json', 'utf8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Ein Fehler ist aufgetreten:', err);
  }
}

module.exports = { searchInNestedJSON, searchInJSON, loadChannelUsers };

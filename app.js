fetch('tags_with_pos.json')
  .then(function(response) {
    return response.json();
  })
  .then(function(myJson) {
    console.log(JSON.stringify(myJson));
    document.getElementById('tags').innerHTML = JSON.stringify(myJson);
  });

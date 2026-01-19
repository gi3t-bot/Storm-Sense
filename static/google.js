

var url = 'https://newsapi.org/v2/everything?' +
          'q=Apple&' +
          'from=2018-10-10&' +
          'sortBy=popularity&' +
          'apiKey=5b193e44ddb140bd8500f31028bcf9b7';

var req = new Request(url);

fetch(req)
    .then(function(response) {
        console.log(response.json());
    })


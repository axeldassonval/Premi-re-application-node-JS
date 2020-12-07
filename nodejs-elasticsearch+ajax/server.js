const http = require('http');
const url = require('url');
const fs = require('fs');
const path = require('path');
const bdd = require('./data');
// vous pouvez passer le paramètre en ligne de commande. ex. node static_server.js 3000
const port = process.argv[2] || 8080;

let server = http.createServer();

let affiche = function(request, response, query) // fonction pour recuperer la liste
{
	bdd.findDocs('liste_course', query.q || '',
		function(error, result)
		{
			if (error instanceof Error)
			{
				response.status(500).end();
				console.log(error);
				return;
			}

			response.end(JSON.stringify(result && result.hits));
		}
	);
};

// Cette fonction sert à lire le body envoyé dans une requête, attendre la fin et retourner ce body
let readBody = function(request, callback) {

	// On initialise le body vide
	let body = '';

	// Dès qu'on reçoit une donnée, on la met à la suite du body
	request.on('data', function(chunk) {
		body += chunk.toString();
	});

	// Quand c'est fini, on appelle le callback avec le résultat
	request.on('end', function() {
		callback(null, body);
	});

};

server.on('request', function(request, response) {//contient tous se qui doit tourner sure le serveur

	let parsed = url.parse(request.url, true);

	console.log('Nouvelle requete', request.method, parsed.pathname, JSON.stringify(parsed.query));//console log basique

	switch (parsed.pathname.toLowerCase()) {
		case '/index.html': case '/index.css': case '/index.js': case '/': case '/images/cadre2.jpg': case '/images/cadre.jpg':

			let pathName = (parsed.pathname.toLowerCase() === '/') ? '/index.html' : parsed.pathname;
			let pathExtension = pathName.split('.').pop();

			// On met le header
			switch (pathExtension) {
				case 'jpg':
					response.setHeader('content-type', 'image/jpg');
					break;
				case 'css':
					response.setHeader('content-type', 'text/css');
					break;
				case 'html':
					response.setHeader('content-type', 'text/html');
					break;
				case 'js':
					response.setHeader('content-type', 'application/javascript');
					break;
				default:
					response.setHeader('content-type', 'text/plain');
					break;
			}

			// On écrit le contenu
			let content = fs.readFileSync('.' + pathName);
			response.write(content);
			response.end();

			return;

		case '/list.json':
			response.setHeader('content-type', 'application/json');
			break;

		default:
			response.writeHead(404, {'content-type': 'text/html'}); // definis une erreur 404
			response.end();//message de page inexistante
			return;
	}

	let query = parsed.query;

	switch (request.method) {
		case 'POST'://ajout a la liste

			readBody(request, function(error, body) {
				if (error instanceof Error) {
					response.writeHead(500, {'content-type': 'application/json'});
					response.end('{ "error": "ça a foiré" }');
					return;
				}
				if (! body) {
					response.writeHead(400, {'content-type': 'application/json'});
					response.end('{ "error": "Mauvaise requête" }');
					return;
				}

				try {
					body = JSON.parse(body);
				}
				catch (error) {
					response.writeHead(400, {'content-type': 'application/json'});
					response.end('{ "error": "Mauvaise requête" }');
					return;
				}

				if (! body || ! body.title) //mes condition pour eviter les blanc ou undefined dans la liste
				{
					response.writeHead(400, {"content-type":"text/html;charset=utf-8"}); // definis une erreur http
					response.end();//message de page inexistante
					return;
				}

				console.log('NOUVEL ITEM', body.title);

				bdd.insertDoc(
					'liste_course',
					{
						titre: body.title,
						nombre: 1
					},
					function(error, result) {
						if (error instanceof Error) {
							response.writeHead(500, {'content-type': 'application/json'});
							response.end('{ "error": "ça a foiré" }');
							return;
						}

						response.end('{ "id": "' + result._id + '" }');
					}
				);
			});
			return;

		case 'DELETE':
			if (! query.id) {
				response.writeHead(400, {'content-type': 'application/json'});
				response.end('{ "error": "Mauvaise requête" }');
				return;
			}

			bdd.deleteDoc(
				"liste_course",
				query.id,
				function(error) {
					if (error instanceof Error) {
						response.writeHead(500, {'content-type': 'application/json'});
						response.end('{ "error": "ça a foiré" }');
						return;
					}

					response.end('{ "id": "' + query.id + '" }');
				}
			);
			return;

		case 'PUT':

			if (! query.id) {
				response.writeHead(400, {'content-type': 'application/json'});
				response.end('{ "error": "Mauvaise requête" }');
				return;
			} else {
				readBody(request, function(error, body) {
					if (error instanceof Error) {
						response.writeHead(500, {'content-type': 'application/json'});
						response.end('{ "error": "ça a foiré" }');
						return;
					}
					if (! body) {
						response.writeHead(400, {'content-type': 'application/json'});
						response.end('{ "error": "Mauvaise requête" }');
						return;
					}

					try {
						body = JSON.parse(body);
					}
					catch (error) {
						response.writeHead(400, {'content-type': 'application/json'});
						response.end('{ "error": "Mauvaise requête" }');
						return;
					}

					if (! body ) //mes condition pour eviter les blanc ou undefined dans la liste
					{
						response.writeHead(400, {"content-type":"text/html;charset=utf-8"}); // definis une erreur http
						response.end('{ "error": "Mauvaise requête" }');//message de page inexistante
						return;
					}

					bdd.getDoc("liste_course",query.id, function(error, result) {
						if (error instanceof Error) {
							response.writeHead(500, {"content-type":"text/html;charset=utf-8"}); // definis une erreur http
							response.end('{ "error": "ElasticSearch a foiré" }');
							return;
						}
						if (! result) {
							response.writeHead(404, {"content-type":"text/html;charset=utf-8"}); // definis une erreur http
							response.end('{ "error": "Le document n\'existe pas" }');
							return;
						}

						let newSource = result._source;
						if (body.titre && body.titre !== result._source.titre) {
							newSource.titre = body.titre;
						}
						if (body.nombre && body.nombre !== result.nombre) {
							newSource.nombre = body.nombre;
						}
						bdd.updateDoc("liste_course",query.id, newSource, function(error, result) {
							if (error instanceof Error) {
								response.writeHead(500, {"content-type":"text/html;charset=utf-8"}); // definis une erreur http
								response.end('{ "error": "ElasticSearch a foiré" }');
								return;
							}
							response.end('{ "id": "' + query.id + '" }');
						});
					});
				});
				return;
			}

		default:
			affiche(request,response, query);
			return;
	}
});

server.listen(parseInt(port));
console.log(`Le serveur écoute sur le port ${port}`);

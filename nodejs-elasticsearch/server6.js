'use strict';

let http = require('http');// appelle de la fonction http de node js
let fs = require('fs');// appelle de la fonction fichier de node js sapplique a html css et autre
let url = require('url');
let bdd= require("./data");



//==========================================================================================================================================
let server = http.createServer(); //créer le serveur grace a la fonction http

let affiche = function(request, response, query) // fonction pour recuperer la liste
{
	response.writeHead(200, {"content-type":"text/html;charset=utf-8"});//fournit les information du type de contenue attendue  ainsi que si la page a etai correctement charger avec le coder http 200

	fs.readFile('index6.html', 'utf-8', function(error,data) {
		if (error instanceof Error) {
			response.status(500).end();
			console.log(error);
			return;
		}

		bdd.findDocs('liste_course', query.q || '',
			function(error, result)//permet d'indiquer ou chercher et quoi
			{
				if (error instanceof Error)
				{
					response.status(500).end();
					console.log(error);
					return;
				}

				let liste = '';
				result.hits.hits.forEach(
					function(ingredient) //parcour mon tableau pour afficher la liste
					{
						liste += '<li>';
						liste += ' <input type="text" name="prenom" placeholder=' + ingredient._source.titre + '>';
						liste += '('+ingredient._source.nombre+')';
						liste += ' <a class="super-bouton" href="/?supermethod=DELETE&id=' + ingredient._id + '"> x </a>';
						liste += ' <a class="super-bouton" href="/?supermethod=PUT&id=' + ingredient._id + '&action=plus&nombre=' + ingredient._source.nombre + '"> + </a>';
						liste += ' <a class="super-bouton" href="/?supermethod=PUT&id=' + ingredient._id + '&action=moins&nombre=' + ingredient._source.nombre + '"> - </a>';
						liste += ' <a class="super-bouton" href="/?supermethod=PUT&id=' + ingredient._id + '&action=modif"> ~ </a>';
						liste += '</li>'; // aspect visuelle de ma liste
					}
				);
				data = data.replace('{{liste}}', liste); // remplace dans mon html {{liste}}prat les mot entrer

				response.end(data);// premet dafficher du contenue en fin de page
			}
		);
	});
};

//==========================================================================================================================================
server.on('request', function(request,response) {//contient tous se qui doit tourner sure le serveur

	console.log("nouvelle requete");//console log basique

	let parsed = url.parse(request.url, true);

	if (parsed.pathname !== '/' ) {
		response.writeHead(404, {"content-type":"text/html;charset=utf-8"}); // definis une erreur 404
		response.end();//message de page inexistante
		return;
	}
	let query = parsed.query;

	let key = query.supermethod;

	switch (key) {
		case 'POST'://ajout a la liste

			if (query.ajout === '' || query.ajout === undefined) //mes condition pour eviter les blanc ou undefined dans la liste
			{
				response.writeHead(400, {"content-type":"text/html;charset=utf-8"}); // definis une erreur http
				response.end();//message de page inexistante
				return;
			}
			console.log(query.ajout+"1");
			bdd.insertDoc(
				"liste_course",
				{
					titre: query.ajout,
					nombre: 1
				},
				function(error, result) {
					console.log(result._id);
					//data = data.replace('{{id}}', result._id);
					affiche(request,response, query);
				}

			);
			console.log(query.ajout)//voire se que jai ajouter dans la console
			return;

		case 'DELETE'://supression de la liste
			bdd.deleteDoc(
				"liste_course",
				query.id,
				function(error, result) {
					console.log(result._id);
					affiche(request,response, query);
				}
			);
			return;

		case 'PUT':
			//===================================================================================================
			if (query.action === 'plus' && query.id) {
				// J'AJOUTE 1 AU NOMBRE, PUIS...
				let add = parseInt(query.nombre, 10);
				if (isNaN(add))
				{
					affiche(request,response, query);
					return;
				}
				add = add + 1;
				console.log("test id:"+query.id);
				bdd.getDoc("liste_course",query.id,
					function(error, result) {
						if (error instanceof Error) {
							affiche(request,response, query);
							return;
						}
						console.log(result);
						let newSource = result._source;
						newSource.nombre = add;
						bdd.updateDoc("liste_course",query.id, newSource,
							function(error, result) {
								if (error instanceof Error) {
									affiche(request,response, query);
									return;
								}
								console.log(result);
								affiche(request,response, query);
							}
						);
					}
				);
				return;
			}
			//===================================================================================================
			if (query.action === 'moins' && query.id) {
				// J'AJOUTE 1 AU NOMBRE, PUIS...
				let moin = parseInt(query.nombre, 10);
				if (isNaN(moin))
				{
					affiche(request,response, query);
					return;
				}
				moin = moin - 1;
				console.log("test id:"+query.id);
				bdd.getDoc("liste_course",query.id,
					function(error, result) {
						if (error instanceof Error) {
							affiche(request,response, query);
							return;
						}
						console.log(result);
						let newSource = result._source;
						newSource.nombre = moin;
						bdd.updateDoc("liste_course",query.id, newSource,
							function(error, result) {
								if (error instanceof Error) {
									affiche(request,response, query);
									return;
								}
								console.log(result);
								affiche(request,response, query);
							}
						);
					}
				);
				return;
			}

			//===================================================================================================
			// JE MODIFIE LE TITRE ET PUIS...

			if (query.action === 'modif' && query.id) {

				if (query.modif === "" || query.modif === undefined)
				{
					affiche(request,response, query);
					return;
				}
				console.log("test id:"+query.id);
				bdd.getDoc("liste_course",query.id,
					function(error, result) {
						if (error instanceof Error) {
							affiche(request,response, query);
							return;
						}
						console.log(result);
						let newSource = result._source;
						newSource.titre = query.modif;
						bdd.updateDoc("liste_course",query.id, newSource,
							function(error, result) {
								if (error instanceof Error) {
									affiche(request,response, query);
									return;
								}
								console.log(result);
								affiche(request,response, query);
							}
						);
					}
				);
			}

		default:
			affiche(request,response, query);
			return;
	}
});

server.listen(8080); // port d'ecoute du serveur



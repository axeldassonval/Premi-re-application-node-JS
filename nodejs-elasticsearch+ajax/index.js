
'use strict';

let liTemplate = '';

// J'ajoute (graphiquement seulement) un item dans la liste
let ajouteItemInList = function(id, titre, nombre) {
	let $ul = $('#liste');
	let $li = $(liTemplate);
	$li.appendTo($ul);
	$li.attr('id', 'item-' + id);
	$li.find('input').attr('value', titre);
	$li.find('span.nombre').text(nombre);
};

// L'appel AJAX a réussi
let loadListSuccess = function(data) {
	console.log('SUCCESS', data);

	let $ul = $('#liste');
	if (liTemplate === '') {
		var firstLI = $ul.children('li')[0];
		if (! firstLI) {
			console.log('Oooops ! Petit problème...');
			return;
		}
		liTemplate = $ul.children('li')[0].outerHTML;
	}
	// Je vire tous les éléments de ma liste
	$ul.children('li').remove();

	// Comme data contient mon objet qui va bien, je n'ai plus qu'à afficher un élément de list pour chaque data.hits
	if (data && (data.hits instanceof Array)) {
		data.hits.forEach(function(item) {
			ajouteItemInList(item._id, item._source.titre, item._source.nombre);
		});

		$('button.btn-delete').on('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			let itemId = $(this).closest("li").attr("id").slice(5);
			supprimeItem(itemId);
			return false;
		});
		$('button.btn-modif').closest('form').on('submit', function(event) {
			event.preventDefault();
			event.stopPropagation();
			$('button.btn-modif').blur();
			let itemId = $(this).closest("li").attr("id").slice(5);
			modifItem(itemId);
			return false;
		});

		$('button.btn-modif-plus').closest('.btn-modif-plus').on('click', function(event) {
			$(this).prop('disabled', true).on('click');
			event.preventDefault();
			event.stopPropagation();
			$('button.btn-modif-plus').blur();
			//let nombre = $(this).closest('span').text() + 1;
			let itemId = $(this).closest('li').attr("id").slice(5);
			modifItemPlus(itemId);
			return false;
		});

		$('button.btn-modif-moins').closest('.btn-modif-moins').on('click', function(event) {
			$(this).prop('disabled', true).on('click');
			event.preventDefault();
			event.stopPropagation();
			$('button.btn-modif-moins').blur();
			//let nombre = $(this).closest('span').text() - 1;
			let itemId = $(this).closest('li').attr("id").slice(5);
			modifItemMoin(itemId);
			return false;
		});

		$('button#btn-inscription').on('click', function(event) {
			event.preventDefault();
			event.stopPropagation();
			console.log('inscription')
			$('button#btn-inscription').blur();
			$("br#1").insertAfter('<input class="inscription" id="mdp" placeholder="mot de passe">')

			return false;
		});


	}
};

// L'appel AJAX a foiré
let loadError = function(error) {
	console.log('ERROR', error);
};

// CHargement de la liste
let loadList = function(recherche) {
	let options = {
		url: '/list.json',
		type: 'GET',
		success: loadListSuccess,
		error: loadError
	};

	if (recherche) { options.data = { q: '*'+recherche+'*' }; }

	// Appel AJAX sur /list.json en GET
	$.ajax(options);
};

let itemAEteCree = function(data) {
	console.log('SUCCESS Creation', data);
	if (! data || ! data.id) {
		console.log('Oooops. Pas \'id');
		return;
	}

	let $input = $('input#ajout');
	ajouteItemInList(data.id, $input.val(), 1);
};


// Création
// ----------------------------------------------- A FINIR
let creeItem = function() {
	// Fabriquer l'objet DATA
	let $input = $('input#ajout');
	let value = $input.val().trim();

	if (! value) {
		console.log('Value vide...');
		return;
	}

	let data = { title: value };

	// Appel AJAX sur /list.json en POST
	$.ajax({
		url: '/list.json',
		type: 'POST',
		contentType: 'application/json; charset=UTF-8',
		data: JSON.stringify(data),
		processData: false,
		success: itemAEteCree,
		error: loadError
	});
};

let itemAEteModifie = function(result) {
	console.log('SUCCESS Modification');
};

// Modification
// ----------------------------------------------- A FINIR
let modifItem = function(id) {
	let options = {
		url: '/list.json',
		type: 'PUT',
		contentType: 'application/json; charset=UTF-8',
		processData: false,
		success: itemAEteModifie,
		error: loadError
	};

	if (! id) {
		console.log('Pas d\'ID fourni');
		return;
	}

	let $input = $('li#item-' + id + ' input[type="text"]');
	let value = $input.val().trim();

	if (! value) {
		console.log('Pas de value fournie');
		return;
	}

	options.url += '?id=' + encodeURIComponent(id);

	// Fabriquer l'objet DATA
	options.data = JSON.stringify({ titre: value });

	// Appel AJAX sur /list.json en PUT
	$.ajax(options);
};


let itemAEteModifiePlus = function(result) {
	$('button.btn-modif-plus').prop('disabled', false);
	let $span = $('li#item-' + result.id + ' span.nombre');
	let value = parseInt($span.text(), 10);
	value +=1;
	$span.text(value);
	console.log('SUCCESS Modification nombre +');
};

let modifItemPlus = function(id,nombre) {
	let options = {
		url: '/list.json',
		type: 'PUT',
		contentType: 'application/json; charset=UTF-8',
		processData: false,
		success: itemAEteModifiePlus,
		error: loadError
	};

	if (! id) {
		console.log('Pas d\'ID fourni');
		return;
	}

	let $span = $('li#item-' + id + ' span.nombre');
	let value = parseInt($span.text(), 10);
	if (isNaN(value)) {
		console.log('Pas de value fournie');
		return;
	}
	value = value + 1;

	options.url += '?id=' + encodeURIComponent(id);

	// Fabriquer l'objet DATA
	options.data = JSON.stringify({ nombre: value });

	// Appel AJAX sur /list.json en PUT
	$.ajax(options);
};

let itemAEteModifieMoin = function(result) {
	$('button.btn-modif-moins').prop('disabled', false);
	let $span = $('li#item-' + result.id + ' span.nombre');
	let value = parseInt($span.text(), 10);
	value -=1;
	$span.text(value);
	console.log('SUCCESS Modification nombre -');
};

let modifItemMoin = function(id,nombre) {
	let options = {
		url: '/list.json',
		type: 'PUT',
		contentType: 'application/json; charset=UTF-8',
		processData: false,
		success: itemAEteModifieMoin,
		error: loadError
	};

	if (! id) {
		console.log('Pas d\'ID fourni');
		return;
	}

	let $span = $('li#item-' + id + ' span.nombre');
	let value = parseInt($span.text(), 10);
		value = value - 1;
	if (isNaN(value)) {
		console.log('Pas de value fournie');
		return;
	}

	if (value <= 0) {
		options = {
			url: '/list.json',
			type: 'DELETE',
			success: itemAEteSupprime,
			error: loadError
		};

		options.url += '?id=' + encodeURIComponent(id);
		//options.data = { id: id };

		// Appel AJAX sur /list.json en DELETE
		$.ajax(options);

	}else{
		options.url += '?id=' + encodeURIComponent(id);

		// Fabriquer l'objet DATA
		options.data = JSON.stringify({ nombre: value });

		// Appel AJAX sur /list.json en PUT
		$.ajax(options);
		}
};


let itemAEteSupprime = function(result) {
	$('li#item-' + result.id).remove();
	console.log('SUCCESS Delete');
};

// Suppression

let supprimeItem = function(id) {
	let options = {
		url: '/list.json',
		type: 'DELETE',
		success: itemAEteSupprime,
		error: loadError
	};

	if (! id) {
		console.log('Pas d\'ID fourni');
		return;
	}

	options.url += '?id=' + encodeURIComponent(id);
	//options.data = { id: id };

	// Appel AJAX sur /list.json en DELETE
	$.ajax(options);
};

//======================================================================================================
// A charger dès que le DOM est prêt
let whenDocumentIsReady = function() {
	let down = false;
	console.log(down);

	// On paramètre le comportement au click sur le titre connexion
	$('div.card.axel > h5').on('click', function(event) {
		if (down) {
			console.log('click down');
			down = false;
			$(this).parent().find('.card-body').slideUp(400);
			$('.card.axel').css({height: '2.5rem', Transition: '500ms'});
		}
		else{
			console.log('click up');
			down = true;
			$(this).parent().find('.card-body').slideDown(400);
			$('.card.axel').css(
				{
					height: '20rem' ,
					Transition: '500ms'
				});
		}
	});

	// On paramètre l'ajout au click sur le bouton qui va bien
	$('button#btn-ajout').on('click', function(event) {
		creeItem();
	});

	$('button#btn-recherche').closest('form').on('submit', function(event) {
		event.preventDefault();
		event.stopPropagation();
		loadList($(this).find('#input-recherche').val());
		return false;
	});
	// On charge la liste
	loadList();
};
// Seul instruction qui s'exécute en temps réel.
// Comme elle fait appel à jquery ($) alors s'assurer qu'on a chargé jquery avant ce script...
$(document).ready(whenDocumentIsReady);

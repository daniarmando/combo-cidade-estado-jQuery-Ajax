var ComboEstadoCidade = ComboEstadoCidade || {};

ComboEstadoCidade.Estado = (function() {

	function Estado() {
		this.combo = $('.estado');	
		this.emitter = $({});
		this.on = this.emitter.on.bind(this.emitter);	
	}

	Estado.prototype.iniciar = function() {
		this.combo.on('change', onEstadoAlterado.bind(this));
		inicializarEstados.call(this);
	}

	function inicializarEstados() {
			$.ajax({
				url: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados',
				method: 'GET',
				contentType: 'application/json',							
			})
			.done(onBuscarEstadosFinalizado.bind(this))
			.fail(function() {
				alert('Erro ao buscar estados')
			});			
	}

	function onBuscarEstadosFinalizado(estados) {
		var options = [];
		var estadosOrdenados = estados.sort(function(a, b) {
			return a.nome.localeCompare(b.nome);
		});	

		options.push('<option value="">Selecione o estado</option>');

		estadosOrdenados.forEach(function(estado) {
			options.push('<option value="' + estado.id + '">' + estado.nome + '</option>');
		});

		this.combo.html(options.join(''));		
	}
	
	function onEstadoAlterado() {
		this.emitter.trigger('alterado', this.combo.val());
	}

	return Estado;

}());

ComboEstadoCidade.Cidade = (function() {

	function Cidade(estado) {
		this.comboEstado = estado;
		this.combo = $('.cidade');
		this.imgLoading = $('.js-img-loading');		
	}

	Cidade.prototype.iniciar = function() {
		reset.call(this);		
		this.comboEstado.on('alterado', onEstadoAlterado.bind(this));
		var codigoEstado = this.comboEstado.combo.val();
		inicializarCidades.call(this, codigoEstado);
	};

	function onEstadoAlterado(evento, codigoEstado) {		
		inicializarCidades.call(this, codigoEstado);
	}

	function inicializarCidades(codigoEstado) {
		if (codigoEstado) {
			var resposta = $.ajax({
				url: 'https://servicodados.ibge.gov.br/api/v1/localidades/estados/' + codigoEstado + '/municipios',
				method: 'GET',
				contentType: 'application/json',				
				beforeSend: iniciarRequisicao.bind(this),
				complete: finalizarRequisicao.bind(this)
			});
			resposta.done(onBuscarCidadesFinalizado.bind(this));
		} else {
			reset.call(this);
		}
	}

	function onBuscarCidadesFinalizado(cidades) {
		var options = [];
		var cidadesOrdenadas = cidades.sort(function(a, b) {
			return a.nome.localeCompare(b.nome);
		});
		cidadesOrdenadas.forEach(function(cidade) {
			options.push('<option value="' + cidade.id + '">' + cidade.nome + '</option>');
		});

		this.combo.html(options.join(''));
		this.combo.removeAttr('disabled');	
	}

	function reset() {
		this.combo.html('<option value="">Selecione a cidade</option>');
		this.combo.val('');
		this.combo.attr('disabled', 'disabled');
	}

	function iniciarRequisicao() {
		reset.call(this);
		this.imgLoading.show();
	}

	function finalizarRequisicao() {
		this.imgLoading.hide();
	}

	return Cidade;

}());

$(function() {
	var estado = new ComboEstadoCidade.Estado();
	estado.iniciar();

	var cidade = new ComboEstadoCidade.Cidade(estado);
	cidade.iniciar();
});

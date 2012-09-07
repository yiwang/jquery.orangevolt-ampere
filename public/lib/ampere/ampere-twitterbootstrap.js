/**
 * twitter bootstrap ampere ui
 */
;(window.ov && window.ov.ampere && window.ov.ampere.ui.twitterbootstrap) || (function( $) {
	var _ns = $.ov.namespace( 'window.ov.ampere.ui.twitterbootstrap'); 
	
		/**
		 * declare window.ov.ampere.ui.twitterbootstrap module
		 * for angular 
		 */
	(function() {
		var ampere = angular.module('window.ov.ampere.ui.twitterbootstrap', [ 'ngResource', 'ngCookies']).run( function(/* $rootScope, $window, $http*/) {
			/*
			$rootScope.ov = {
				ampere : {
					util : $window.ov.ampere.util
				}
			};
			*/
		});
		
		var ampereTwitterbootstrapController = function( $scope, $rootElement, $window, $http, $timeout,  $log, $resource, $cookies) {
			var controller = $rootElement.parent().data( 'ampere.controller');
			/* 
			 * TODO : this is a dirty hack to transport the initial template into
			 * the ampere structure of angularjs
			 */ 
			var template = controller._initial_template;
			controller._initial_template = undefined;
			
				// copy services to root scope
			$scope.$window = $window;
			$scope.$http = $http;
			$scope.$timeout = $timeout;
			$scope.$log = $log;
			$scope.$resource = $resource;
			$scope.$cookies = $cookies;
			
			$scope.$ampere = {
				module 	: controller.module,
				ui 	   	: controller.ui,
				template: template, 
				view   	: controller.module.current().view
			};
		};
		ampereTwitterbootstrapController.$inject = ['$scope', '$rootElement', '$window', '$http', '$timeout',  '$log', '$resource', '$cookies'];
		
		ampere.controller( 'amperetwitterbootstrap', ampereTwitterbootstrapController);
		
		ampere.directive( 'ngAmpereState', [ '$compile', '$window', function( $compile, $window) {
			return {
				restrict   : 'A',
				scope      : 'isolate',
				link: function( scope, element, attrs) {
					/*
					var controller = element.parents().filter( function( obj) { return $.data( this, 'ampere.controller'); })
					.data( 'ampere.controller');
					 */

					// var oldChangeset = {};
					scope.$watch( '$ampere', function() {
							// destroy all child scopes (->transitions)
						while( scope.$$childHead) {
							scope.$$childHead.$destroy();
						}
						
						var _ns = $.ov.namespace('ngAmpereTransition(' + scope.$ampere.module.current().state.fullName() + ')');
						_ns.debug( 'ampere changed');
						
							// remove old scope variables
						var properties = Object.keys( scope);
						
						for( var i in properties) {
							if( /*properties[i]!='ampere' &&*/ properties[i]!='this' && properties[i].charAt( 0)!='$') {
								_ns.debug( 'delete previsouly defined scope.' + properties[i]);
								delete scope[ properties[i]];
							}
						}
							// transport state variables into scope
						properties = Object.keys( scope.$ampere.module.current().state);
						for( var i in properties) {
							$.ov.namespace( 'ngState')
							//.assert( properties[i]!='ampere', 'state variable named "ampere" is forbidden')
							.assert( properties[i]!='this', 'state property named "this" is forbidden')
							.assert( properties[i].charAt( 0)!='$', 'state property starting with $ (="', properties[i], '") is forbidden');
							
							if( properties[i]!='promise') {
								scope[ properties[i]] = scope.$ampere.module.current().state[ properties[i]];
								_ns.debug( 'set initial scope.' + properties[i] + '=', $window.$.ov.json.stringify( scope[ properties[i]], $window.$.ov.json.stringify.COMPACT));
							}
						} 
						
						var template = scope.$ampere.template;

						_ns.debug( 'template=' + template);
						
						element.html( template);
						$compile( element.contents())( scope);
					});
					
					scope.$watch( function() {
						var _ns = $.ov.namespace('ngAmpereTransition(' + scope.$ampere.module.current().state.fullName() + ')');
							/*
							 * get current filtered scope variables
							 */  
						var changeset = {}; 	
						var keys = Object.keys( scope);
						for( var i in keys) {
							if( /*keys[i]!='ampere' &&*/ keys[i]!='promise' && keys[i]!='this' && keys[i].charAt( 0)!='$') {
								changeset[ keys[i]] = scope[ keys[i]];
							}
						}
						
							/*
							 * detect changes
							 */ 
						keys = Object.keys( changeset);
							// remove duplicate keys
						$window.jQuery.each( Object.keys( scope.$ampere.module.current().state), function( index, item) {
							$.inArray( item, keys)!=-1 || keys.push( item);
						});
						
							/*
							 * filter out equal values
							 */ 
						var toDelete = [];
						var toSet = [];						
						for( var i in keys) {
							var key = keys[i];
							if( key!='promise') {
								if( !Object.hasOwnProperty.call( changeset, key)) {
									toDelete.push( key);
								} else if( angular.equals( changeset[ key], scope.$ampere.module.current().state[ key])) {
									delete changeset[ key];
								} else {
									toSet.push( key);
								}
							}
						}
	
							/*
							 * if changes occured 
							 */ 
						if( toSet.length || toDelete.length) {
								// set modified properties
							for( var i in toSet) {
								scope.$ampere.module.current().state[ toSet[i]] = changeset[ toSet[i]];
								_ns.debug( scope.$ampere.module.current().state.fullName(), '.', toSet[i], '=', changeset[ toSet[i]]);
							}
							
								// remove deleted properties
							for( var i in toDelete) {
								delete scope.$ampere.module.current().state[ toDelete[i]];
								_ns.debug( 'delete ', scope.$ampere.module.current().state.fullName(), '.', toDelete[i]);
							}
							
							_ns.debug( 'broadcast ampere-model-changed ( ', changeset, ', ', toDelete, ')');
							scope.$root.$broadcast( 'ampere-model-changed', changeset, toDelete);
						}
					});
					
					//scope.$watch( 'controller.module.current().view', function() {
					/*
						var view = controller.module.current().view;
						var template = view.template();
						
						if( $.isFunction( template.promise)) {
							$.ov.namespace( 'ngState').assert( template.promise().state()!='success', 'view fragment is not ready : state=', template.promise().state());
							template.promise().done( function( data) {
								template = data.jquery ? data.text() : data;
							});
						}
						
			            element.html( template);
		                $compile(element.contents())( scope);
		                */
					//});								
				}
				/*
				compile    : function( element, attr) {
					var controller = element.parents().filter( function( obj) { return $.data( this, 'ampere.controller'); })
					.data( 'ampere.controller');
					
					return function( scope, element) {
						var childScope;
						
						//
						// function() {
						// 	return controller.module.current().state;
						// } 
						// 
						// should also be working 
						//
						scope.$watch( 'module().current().state', function(src) {
							if( childScope) {
								childScope.$destroy();
							}
				            
							var view = controller.current().view;
							var template = view.template();
							
							if( $.isFunction( template.promise)) {
								$.ov.namespace( 'ngState').assert( template.promise().state()!='success', 'view fragment is not ready : state=', template.promise().state());
								template.promise().done( function( data) {
									template = data.jquery ? data.text() : data;
								});
							}
							
							childScope = scope.$new();
							
				            element.html( template);
			                $compile(element.contents())(childScope);
			               // scope.$eval('module().current().state');
						});
					};
				}*/
			};
		}]);
		
		ampere.directive( 'ngAmpereTransition', [ '$compile', '$parse', '$window', function( $compile, $parse, $window) {
			var templates = {
				'a' 	: '<a href="javascript:void(0)"'
					+ 'class="ampere-transition {{attrs.class}} {{hotkey && \'ampere-hotkey\'}}"'
   					+ 'ng-class="{disabled : !transition.enabled()}"'
   					+ 'accesskey="{{attrs.accesskey}}"'
   					+ 'style="{{attrs.style}}"'
       				+ 'title="{{attrs.title || $ampere.ui.getDescription( transition)}}{{hotkey}}">'
       				+ '<i ng-class="$ampere.ui.getIcon( transition)"></i>'
       				+ '{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}'
       				+ '</a>',
       			'button' : '<button type="button"'
   					+ 'ng-disabled="!transition.enabled()"'
   					+ 'class="ampere-transition name-{{transition.name()}} btn {{attrs.class}} {{hotkey && \'ampere-hotkey\'}}"'
   					+ 'accesskey="{{attrs.accesskey}}"'
   					+ 'style="{{attrs.style}}"'
       				+ 'title="{{attrs.title || $ampere.ui.getDescription( transition)}}{{hotkey}}">'
       				+ '<i ng-class="$ampere.ui.getIcon( transition)"></i>'
					+ '{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}'
					+ '</button>',
				'submit' : '<button type="submit"'
   					+ 'ng-disabled="!transition.enabled()"'
   					+ 'class="ampere-transition name-{{transition.name()}} btn {{attrs.class}} {{hotkey && \'ampere-hotkey\'}}"'
   					+ 'accesskey="{{attrs.accesskey}}"'
   					+ 'style="{{attrs.style}}"'
       				+ 'title="{{attrs.title || $ampere.ui.getDescription( transition)}}{{hotkey}}">'
       				+ '<i ng-class="$ampere.ui.getIcon( transition)"></i>'
					+ '{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}'
					+ '</button>',
				'reset' : '<button type="reset"'
   					+ 'ng-disabled="!transition.enabled()"'
   					+ 'class="ampere-transition name-{{transition.name()}} btn {{attrs.class}} {{((attrs.ngAmpereHotkey || $ampere.ui.getHotkey( transition)) && \'ampere-hotkey\')}}"'
   					+ 'accesskey="{{attrs.accesskey}}"'
   					+ 'style="{{attrs.style}}"'
       				+ 'title="{{attrs.title || $ampere.ui.getDescription( transition)}}{{(attrs.ngAmpereHotkey || $ampere.ui.getHotkey( transition)) && (\'(\' + (attrs.ngAmpereHotkey || $ampere.ui.getHotkey( transition)) + \')\')}}">'
       				+ '<i ng-class="$ampere.ui.getIcon( transition)"></i>'
					+ '{{$.trim( element.text()) || $ampere.ui.getCaption( transition)}}'
					+ '</button>'
			};
			/*
			 * does not work yet
				// compile templates
			var names = Object.keys( templates);
			for( var i in names) {
				templates[names[i]] = $compile( templates[ names[i]]);
			}
			*/
			
			var _ns = $.ov.namespace('ngAmpereTransition');
			
			return {
				restrict   : 'A',
				scope 	   : 'isolate',
				link: function(scope, element, attrs) {
					/*
					var controller = element.parents().filter( function( obj) { return $.data( this, 'ampere.controller'); })
					.data( 'ampere.controller');
					*/
					scope.element = element;
					scope.attrs = attrs;
					scope.$ = $window.jQuery;
					
					scope.$on( 'ampere-model-changed' ,function( /*object*/changeset, /*array<string>*/deleted) {
						// _ns.debug( scope.transition.fullName(),' ampere-model-changed (', changeset, ', ', deleted, ')');
						if( scope.transition){
							scope.$enabled = scope.transition.enabled();
						} 
					});
					
					scope.$watch( attrs.ngAmpereTransition, function( oldValue, newValue) {
						if( !newValue) {
							 element.replaceWith( '<span style="background-color:crimson; color:white">' + 'attribute "ng-ampere-transition" (="' + attrs.ngAmpereTransition + '") does not resolve to a ampere transition' + '</span>');
							 return;
						}
						
						_ns = $.ov.namespace('ngAmpereTransition(' + newValue.fullName() + ')');

						var type = attrs.type || ($.inArray( element[0].tagName.toLowerCase(), Object.keys( templates))!=-1 ? element[0].tagName.toLowerCase() : 'button');
						
						scope.transition = newValue;
						
						scope.$enabled = scope.transition.enabled();
						
						_ns.assert( 
							$.type( scope.transition)=='object' && scope.transition.constructor && scope.transition.constructor.name=='Transition', 
							'attribute "ng-ampere-transition" (="', attrs.ngAmpereTransition, '") does not resolve to a ampere transition'
						);
						
						if( templates[ type]) {
							var f = $compile( templates[ type]);
							var replacement = f( scope);
							element.replaceWith( replacement);
							
							var hotkey = attrs.ngAmpereHotkey || scope.$ampere.ui.getHotkey( scope.transition);

							if( hotkey) {
								_ns.debug( 'bind hotkey ', hotkey);
								
								var _hotkey = hotkey.replace(/\+/g, '_'); 								
								scope.hotkey = ' (' + window.ov.ampere.util.ucwords( hotkey) + ')';
								
								function onHotKey( event) {
									_ns.debug( 'hotkey activated');
									event.preventDefault();
									onTransitionClicked.call( replacement, event);
								};
								$( 'body').on( 'keydown.' + _hotkey, onHotKey);
								
								scope.$on( '$destroy' ,function() {
									_ns.debug( 'unbind hotkey ', hotkey);
									$( 'body').off( 'keydown.' + _hotkey, onHotKey);
								});
							}
						} else {
							_ns.raise( 'type "', type, '" is unknown');
						}
					});
				}
			};
		}]);
	})();
	
		/**
		 * twitter bootstrap scroll functionality
		 * 
		 *  http://stackoverflow.com/questions/9179708/replicating-bootstraps-main-nav-and-subnav
		 */
	function onBodyscroll() {
	    // If has not activated (has no attribute "data-top"
	    if( !$('.subnav').attr('data-top')) {
	        // If already fixed, then do nothing
	        if ($('.subnav').hasClass('subnav-fixed')) return;
	        // Remember top position
	        var offset = $('.subnav').offset();
	        $('.subnav').attr('data-top', offset.top);
	    }

	    if( $('.subnav').attr('data-top') - $('.subnav').outerHeight() <= $(this).scrollTop())
	        $('.subnav').addClass('subnav-fixed');
	    else
	        $('.subnav').removeClass('subnav-fixed');
	};
	
		/**
		 * a transition was clicked
		 */
	function onTransitionClicked( event) {
		var transition = angular.element( this).scope().transition;
		var controller = $( this).closest( '.ampere-app').ampere();

		!controller.ui.isBlocked() && controller.proceed( transition);
	
		event.preventDefault();
			// prevent any other hotkey handler to be invoked
		event.stopImmediatePropagation();
	}

	/**
	 * focuses first form element in computed template 
	 */
	function focus( /*jquery*/root) {
		//var formControls = root.find( '.ampere-state .ampere-view :input:not(input[type=button],input[type=submit],button),select,textarea').filter( '[tabIndex!="-1"]:visible');
		var formControls = root.find( '.ampere-state .ampere-view input,select,textarea,button').filter( '[tabIndex!="-1"]:visible:enabled');
		if( !formControls.filter( '*[autofocus]').focus().length) {
			formControls.first().focus();
		}
	}
	
	function onActionAbort() {
		console.log( 'action aborted');
		
		var controller = $( this).closest( '.ampere-app').ampere();
		
		if( confirm( 'Really abort transition ?')) {
			var flash = controller.element.find( '.flash');
			
			var deferred = flash.data( 'ampere.action-deferred');
			_ns.assert( deferred && $.isFunction( deferred.promise), 'no action deferred registered on flash element');

			flash.hide();
			
				// trigger handler
			deferred.reject( controller);
		}
	}
	
	function twitterbootstrap( controller, options) {
		if( !(this instanceof twitterbootstrap)) {
			return new twitterbootstrap( controller, options);
		}
		var self = this;
		
		this._super( controller, angular.extend( {}, twitterbootstrap.defaults, options || {}));
		
		if( Object.hasOwnProperty.call( this.options(), 'ampere.ui.layout')) {
			var layout = this.options( 'ampere.ui.layout');
			this.template = layout
				? $.get( layout)
				: $.get( this.options( 'ampere.baseurl') + '/ampere-twitterbootstrap.nolayout.tmpl')
			;
		} else {
			this.template = $.get( this.options( 'ampere.baseurl') + '/ampere-twitterbootstrap.layout.tmpl');
		}
			
		
		/*
		 * automagically add 'ampere.ui.type':'global' for module transactions 
		 */
		for( var name in controller.module.transitions) {
			var transition = controller.module.transitions[ name];
			// doesnt work if value is undefined : 
			//if( !Object.hasOwnProperty( transition.options(), 'ampere.ui.type')) {
			if( !('ampere.ui.type' in transition.options())) {
				transition.options( 'ampere.ui.type','global');
			}
		}
		
		this.init = function() {
			(this.controller.element[0].tagName=="BODY") && $( document).on( 'scroll', onBodyscroll);
			
			this.controller.element.on( 'click', '.ampere-transition', onTransitionClicked);
			
			this.controller.element.on( 'click', '.flash .alert button.close', onActionAbort); 
			
			focus( controller.element);
		};

		this.destroy = function( controller) {
			(this.controller.element[0].tagName=="BODY") && $( document).off( 'scroll', onBodyscroll);
			
			this.controller.element.off( 'click', '.ampere-transition', onTransitionClicked);
			this.controller.element.off( 'click', '.flash .alert button.close', onActionAbort);
		};		
		
		this.isBlocked = function() {
			return this.controller.element.find( '.overlay').hasClass( 'block');
		};
		
		this.block = function() {
			this.controller.element.addClass( 'overlay').find( '.overlay').addClass( 'block');
		};
		
		this.unblock = function() {
			this.controller.element.removeClass( 'overlay').find( '.overlay').removeClass( 'block');			
		};

		this.getTemplate = function( view) {
			var template = view.template();

			if( !template) {
				if( this.options( 'ampere.ui.view')) {
					var view = this.options( 'ampere.ui.view');
					template = $.get( view);
				} else {
					template = $.get( this.options( 'ampere.baseurl') + '/ampere-twitterbootstrap.view.tmpl');
				}
			} else if( $.isFunction( template)) {
				template = template.call( scope.$ampere.module.current().view, scope.$ampere.module.current().view);
			};
		 	
			$.ov.namespace( 'ngState').assert( 
				!$.isFunction( template.promise) || template.promise().state()!='success', 
				'view fragment is not ready : state=', $.isFunction( template.promise) ? template.promise().state() : ''
			);
			
			return $.when( $.isFunction( template.promise) ? template.promise() : template);
		};
				
		this.renderAction = function( deferred) {
			var flash = this.controller.element.find( '.flash');
				// reset flash style to default  
			flash.find( '.alert').removeClass( 'alert-error').addClass( 'alert-info');
			flash.find('.progress').show()
			.find( '.bar').css( 'width', '100%');
			
			flash.data( 'ampere.action-deferred', deferred);
			flash.find( '.message').text( 'Transition in progress ...');
			flash.find( 'button.close').show();
			flash.show();
			
			deferred
			.progress( function( message, /* example '12%'*/ progressInPercent) {
				if( arguments.length) {
					message && flash.find( '.message').text( message);
				}
				if( arguments.length==2) {
					flash.find( '.bar').css( 'width', progressInPercent);
				}
			})
			.then( function() {
				flash.hide();
				// dont forget to remove the temporay data after 
				// finishing 
				flash.removeData( 'ampere.action-deferred');
			});
		};
		
		this.renderError = function( message) {
			var flash = this.controller.element.find( '.flash');
				// reset flash style to default  
			flash.find( '.alert').removeClass( 'alert-info').addClass( 'alert-error');
			flash.find('.progress').hide();
			
			flash.find( '.message').text( 'Error occured : ' + message);
			flash.find( 'button.close').hide();
			flash.show();
		};
		
		this.renderState = function( view, template, transitionResult) {
				// remember scroll position
			var scrollX = window.scrollX;
			var scrollY = window.scrollY;
			
			var scope = angular.element( controller.element.find( '>.ampere-module')).scope();
			
			scope.$apply( function() {
					/*
					 * if no view was given - just rerender the current view
					 * this case happens for history.reset
					 */ 
				if( view) {
					scope.$ampere = {
						module   : controller.module,
						ui 	     : controller.ui,
						view     : view,	
							/*
							 * module.current.reset is calling this
							 * function without providing a template
							 * so we take the already used one as fallback  
							 */  
						template : template || scope.$ampere.template 
					};
				} 
			});
			
				// compute optional flash message 
			$.when( transitionResult).done( function() {
				focus( controller.element);
				
				window.scrollTo( scrollX, scrollY);
				//window.scrollTo( 0, 0);
				//onBodyscroll();
				
				if( arguments.length==1 && typeof( arguments[0])=='string') {
					var flash = controller.element.find( '.flash');
					
						// reset flash style to default  
					flash.find( '.alert').removeClass( 'alert-info');
					flash.find( '.progress').hide();
					
					flash.find( '.message').text( arguments[0]);
					flash.find( 'button.close').hide();
					flash.show();
					
					flash.fadeOut( 'slow');
				} 
			});
		};
		
			// see Ampere.Ui
		this.popup = function( url, /* function */ initializer) {
			var popup = $( '<div class="popup"><iframe width="100%" height="100%" border="no" src="' + url + '"></iframe></div>');
			this.controller.element.addClass( 'popup').find( '.ampere-module').append( popup);

			popup.find( 'iframe').focus();
			
			var deferred = $.Deferred();
			initializer.call( deferred, deferred);		

			var self = this;
			
				// remove popup when deferred is done/rejected 
			deferred.always( function() {
				self.controller.element.removeClass( 'popup');
				popup.remove();
			}); 
			
			return deferred;
		};
		
		this.toggleHelp = function() {
			controller.element.find( '.page-header >.ampere-help').toggle( 'slow');
		};
		
		this.renderBootstrap = function() {
			var controller = this.controller;
			
			var eProgress = $('<div class="progress progress-striped active"><div class="bar" style="width: 100%;"></div></div>'); 
			
			controller.element
			.append( eProgress)
			.css( 'cursor', 'wait');
			
			var bar = controller.element.find( '.bar');
			bar.text( 'Bootstrapping ' + controller.module.name() + ' ...');			
			
			var deferred = $.Deferred();
			
			$.when( controller.module.current().view, controller.module.current().view.template, this.template, controller.module)
			.progress( function() {
				_ns.debug( 'progress', this, arguments);
			})
			.always( function() {
				bar.css( 'width', '100%');
				controller.element.css( 'cursor', '');
			})
			.fail( function( arg) {
				bar
				.text( 'Bootstrapping ' + controller.module.name() + ' failed ! ')
				.append( 
					$('<a href="#">Details</a>').on( 'click', function() {
						controller.element.append( '<div class="alert">' + (self.template.isRejected() ? self.template.statusText + ' : ampere-twitterbootstrap.fragment' : $.ov.json.stringify( args, $.ov.json.stringify.COMPACT)) + '</div>');
					}) 
				);
				$( '.progress', controller.element).addClass( 'progress-danger');
			}).done( function() {
				eProgress.remove();
				
				controller.element
				.append( self.template.responseText);
				
				var template = self.getTemplate( controller.module.current().view); 
				template.done( function( data) {
					if( data instanceof Element) {
						data = $( data);
					}
					template = data.jquery ? data.text() : template.responseText || data;
						/* 
						 * TODO : this is a dirty hack to transport the initial template into
						 * the ampere structure of angularjs
						 */ 
					controller._initial_template = template;
					
					angular.bootstrap( 
						controller.element.find( '>.ampere-module')
						.addClass( 'name-' + controller.module.name()), 
						['window.ov.ampere.ui.twitterbootstrap']
					);
					
					self.init();
					deferred.resolve();
				});
			});
			
			return deferred;
		};
	}
	twitterbootstrap.prototype = window.ov.ampere.ui();
	twitterbootstrap.defaults = {
		'ampere.ui.twitterbootstrap.theme' : 'default'
	};	
	
	window.ov.ampere.defaults['ampere.ui'] = window.ov.ampere.ui.twitterbootstrap = twitterbootstrap;

		// add css class "iframe" to root node if loaded in iframe
		// this css flag can be used to provide different css rules for iframed ampere app modules 
	window.top!==window.self && $('html').addClass( 'iframe');
})( jQuery);
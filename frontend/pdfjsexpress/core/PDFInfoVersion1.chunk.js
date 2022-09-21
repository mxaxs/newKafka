(function(){(window.wpCoreControlsBundle=window.wpCoreControlsBundle||[]).push([[13],{380:function(e,a,t){function n(e){e.Aa(),e.advance();var a=e.current.textContent;return e.Pa(),a}function r(e){var a=[];for(e.Aa();e.advance();){var t=e.Fa();"field"===t?a.push(String(e.ea("name"))):Object(g.j)("unrecognised field list element: "+t)}return e.Pa(),a}function c(e,a){return a?"false"!==e:"true"===e}function o(e,a){var t=e.Fa();switch(t){case"javascript":return{name:"JavaScript",javascript:e.current.textContent};case"uri":return{name:"URI",uri:e.ea("uri")};case"goto":if(t=null,e.Aa(),e.advance()){var n=e.ea("fit");if(t={page:e.ea("page"),fit:n},"0"===t.page)Object(g.j)("null page encountered in dest");else switch(a=a(Number(t.page)),n){case"Fit":case"FitB":break;case"FitH":case"FitBH":t.top=a.la({x:0,y:e.ea("top")||0}).y;break;case"FitV":case"FitBV":t.left=a.la({x:e.ea("left")||0,y:0}).x;break;case"FitR":n=a.la({x:e.ea("left")||0,y:e.ea("top")||0}),a=a.la({x:e.ea("right")||0,y:e.ea("bottom")||0}),a=new h.d(n.x,n.y,a.x,a.y),t.top=a.y1,t.left=a.x1,t.bottom=a.y2,t.right=a.x2;break;case"XYZ":n=a.la({x:e.ea("left")||0,y:e.ea("top")||0}),t.top=n.y,t.left=n.x,t.zoom=e.ea("zoom")||0;break;default:Object(g.j)("unknown dest fit: "+n)}t={name:"GoTo",dest:t}}else Object(g.j)("missing dest in GoTo action");return e.Pa(),t;case"submit-form":for(t={name:"SubmitForm",url:e.ea("url"),format:e.ea("format"),method:e.ea("method")||"POST",exclude:c(e.ea("exclude"),!1)},a=e.ea("flags"),t.flags=a?a.split(" "):[],e.Aa();e.advance();)switch(a=e.Fa(),a){case"fields":t.fields=r(e);break;default:Object(g.j)("unrecognised submit-form child: "+a)}return e.Pa(),t;case"reset-form":for(t={name:"ResetForm",exclude:c(e.ea("exclude"),!1)},e.Aa();e.advance();)switch(a=e.Fa(),a){case"fields":t.fields=r(e);break;default:Object(g.j)("unrecognised reset-form child: "+a)}return e.Pa(),t;case"hide":for(t={name:"Hide",hide:c(e.ea("hide"),!0)},e.Aa();e.advance();)switch(a=e.Fa(),a){case"fields":t.fields=r(e);break;default:Object(g.j)("unrecognised hide child: "+a)}return e.Pa(),t;case"named":return{name:"Named",action:e.ea("name")};default:Object(g.j)("Encountered unexpected action type: "+t)}return null}function i(e,a,t){var n={};for(e.Aa();e.advance();){var r=e.Fa();switch(r){case"action":if(r=e.ea("trigger"),a&&-1===a.indexOf(r))Object(g.j)("encountered unexpected trigger on field: "+r);else{for(n[r]=[],e.Aa();e.advance();){var c=o(e,t);Object(p.isNull)(c)||n[r].push(c)}e.Pa()}break;default:Object(g.j)("encountered unknown action child: "+r)}}return e.Pa(),n}function s(e){return new m.a(e.ea("r")||0,e.ea("g")||0,e.ea("b")||0,e.ea("a")||1)}function l(e,a){var t=e.ea("name"),n=e.ea("type")||"Type1",r=e.ea("size"),c=a.la({x:0,y:0});for(r=a.la({x:Number(r),y:0}),a=c.x-r.x,c=c.y-r.y,t={name:t,type:n,size:Math.sqrt(a*a+c*c)||0,strokeColor:[0,0,0],fillColor:[0,0,0]},e.Aa();e.advance();)switch(n=e.Fa(),n){case"stroke-color":t.strokeColor=s(e);break;case"fill-color":t.fillColor=s(e);break;default:Object(g.j)("unrecognised font child: "+n)}return e.Pa(),t}function d(e){var a=[];for(e.Aa();e.advance();){var t=e.Fa();switch(t){case"option":t=a;var n=t.push,r=e;r={value:r.ea("value"),displayValue:r.ea("display-value")||void 0},n.call(t,r);break;default:Object(g.j)("unrecognised options child: "+t)}}return e.Pa(),a}function u(e,a){var t=e.ea("name"),r={type:e.ea("type"),quadding:e.ea("quadding")||"Left-justified",maxLen:e.ea("max-len")||-1},c=e.ea("flags");for(Object(p.isString)(c)&&(r.flags=c.split(" ")),e.Aa();e.advance();)switch(c=e.Fa(),c){case"actions":r.actions=i(e,["C","F","K","V"],(function(){return a}));break;case"default-value":r.defaultValue=n(e);break;case"font":r.font=l(e,a);break;case"options":r.options=d(e);break;default:Object(g.j)("unknown field child: "+c)}return e.Pa(),new window.Annotations.ga.na(t,r)}function f(e,a){switch(e.type){case"Tx":try{if(Object(v.c)(e.actions))return new j.a.DatePickerWidgetAnnotation(e,a)}catch(t){Object(g.j)(t)}return new j.a.TextWidgetAnnotation(e,a);case"Ch":return e.flags.get(k.WidgetFlags.COMBO)?new j.a.ChoiceWidgetAnnotation(e,a):new j.a.ListWidgetAnnotation(e,a);case"Btn":return e.flags.get(k.WidgetFlags.PUSH_BUTTON)?new j.a.PushButtonWidgetAnnotation(e,a):e.flags.get(k.WidgetFlags.RADIO)?new j.a.RadioButtonWidgetAnnotation(e,a):new j.a.CheckButtonWidgetAnnotation(e,a);case"Sig":return new j.a.SignatureWidgetAnnotation(e,a);default:Object(g.j)("Unrecognised field type: "+e.type)}return null}function b(e,a,t,n){var c=[],o={};e.Aa();var d=[],b={},p=[];Object(w.a)((function(){if(e.advance()){var t=e.Fa();switch(t){case"calculation-order":d="calculation-order"===e.Fa()?r(e):[];break;case"document-actions":b=i(e,["Init","Open"],a);break;case"pages":for(t=[],e.Aa();e.advance();){var n=e.Fa();switch(n){case"page":n=t;var j=n.push,m=e,w=a,k={number:m.ea("number")};for(m.Aa();m.advance();){var x=m.Fa();switch(x){case"actions":k.actions=i(m,["O","C"],w);break;default:Object(g.j)("unrecognised page child: "+x)}}m.Pa(),j.call(n,k);break;default:Object(g.j)("unrecognised page child: "+n)}}e.Pa(),p=t;break;case"field":n=u(e,a(1)),o[n.name]=n;break;case"widget":for(t={border:{style:"Solid",width:1},backgroundColor:[],fieldName:e.ea("field"),page:e.ea("page"),index:e.ea("index")||0,rotation:e.ea("rotation")||0,flags:[],isImporting:!0},(n=e.ea("appearance"))&&(t.appearance=n),(n=e.ea("flags"))&&(t.flags=n.split(" ")),e.Aa();e.advance();)switch(n=e.Fa(),n){case"rect":j=e,m=a(Number(t.page)),n=m.la({x:j.ea("x1")||0,y:j.ea("y1")||0}),j=m.la({x:j.ea("x2")||0,y:j.ea("y2")||0}),n=new h.d(n.x,n.y,j.x,j.y),n.normalize(),t.rect={x1:n.x1,y1:n.y1,x2:n.x2,y2:n.y2};break;case"border":for(n=e,j={style:n.ea("style")||"Solid",width:n.ea("width")||1,color:[0,0,0]},n.Aa();n.advance();)switch(m=n.Fa(),m){case"color":j.color=s(n);break;default:Object(g.j)("unrecognised border child: "+m)}n.Pa(),t.border=j;break;case"background-color":t.backgroundColor=s(e);break;case"actions":t.actions=i(e,"E X D U Fo Bl PO PC PV PI".split(" "),a);break;case"appearances":for(n=e,j=Object(v.b)(t,"appearances"),n.Aa();n.advance();)if(m=n.Fa(),"appearance"===m){for(m=n.ea("name"),w=Object(v.b)(j,m),m=n,m.Aa();m.advance();)switch(k=m.Fa(),k){case"Normal":Object(v.b)(w,"Normal").data=m.current.textContent;break;default:Object(g.j)("unexpected appearance state: ",k)}m.Pa()}else Object(g.j)("unexpected appearances child: "+m);n.Pa();break;case"extra":for(n=e,j=a,m={},n.Aa();n.advance();)switch(w=n.Fa(),w){case"font":m.font=l(n,j(1));break;default:Object(g.j)("unrecognised extra child: "+w)}n.Pa(),n=m,n.font&&(t.font=n.font);break;case"captions":j=e,n={},(m=j.ea("Normal"))&&(n.Normal=m),(m=j.ea("Rollover"))&&(n.Rollover=m),(j=j.ea("Down"))&&(n.Down=j),t.captions=n;break;default:Object(g.j)("unrecognised widget child: "+n)}e.Pa(),(n=o[t.fieldName])?(t=f(n,t),c.push(t)):Object(g.j)("ignoring widget with no corresponding field data: "+t.fieldName);break;default:Object(g.j)("Unknown element encountered in PDFInfo: "+t)}return!0}return!1}),(function(){e.Pa(),t({calculationOrder:d,widgets:c,fields:o,documentActions:b,pages:p,custom:[]})}),n)}t.r(a),t.d(a,"parse",(function(){return b}));var g=t(1),p=t(0);t.n(p);var j=t(105),h=t(3),m=t(14),w=t(18),v=t(89),k=t(29)}}])}).call(this||window);
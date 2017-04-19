// Generated automatically by nearley
// http://github.com/Hardmath123/nearley
(function () {
function id(x) {return x[0]; }

  class Atom { constructor(data) { this.data = data } toJSON(){ return this.data; } }
  class Tuple { constructor(data) { this.data = data } toJSON() { return this.data.map(item => item.toJSON()); } }
var grammar = {
    ParserRules: [
    {"name": "_$ebnf$1", "symbols": []},
    {"name": "_$ebnf$1", "symbols": ["_$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "_", "symbols": ["_$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "__$ebnf$1", "symbols": ["wschar"]},
    {"name": "__$ebnf$1", "symbols": ["__$ebnf$1", "wschar"], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "__", "symbols": ["__$ebnf$1"], "postprocess": function(d) {return null;}},
    {"name": "wschar", "symbols": [/[ \t\n\v\f]/], "postprocess": id},
    {"name": "MAIN", "symbols": ["_", "TUPLEPART", "_"], "postprocess": d => d[1]},
    {"name": "TUPLE", "symbols": [{"literal":"("}, "_", "TUPLEPART", "_", {"literal":")"}], "postprocess": d => new Tuple(d[2])},
    {"name": "TUPLEPART", "symbols": ["TUPLEPART", "__", "TUPLEPART"], "postprocess": d => [].concat(d[0], d[2])},
    {"name": "TUPLEPART", "symbols": ["TUPLE"]},
    {"name": "TUPLEPART", "symbols": ["ATOM"]},
    {"name": "ATOM$ebnf$1", "symbols": [/[^\s()\n]/]},
    {"name": "ATOM$ebnf$1", "symbols": ["ATOM$ebnf$1", /[^\s()\n]/], "postprocess": function arrpush(d) {return d[0].concat([d[1]]);}},
    {"name": "ATOM", "symbols": ["ATOM$ebnf$1"], "postprocess": d => new Atom(d[0].join(''))}
]
  , ParserStart: "MAIN"
}
if (typeof module !== 'undefined'&& typeof module.exports !== 'undefined') {
   module.exports = grammar;
} else {
   window.grammar = grammar;
}
})();

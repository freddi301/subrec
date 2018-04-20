![help](https://img.shields.io/badge/ideas-welcome-brightgreen.svg)
![help](https://img.shields.io/badge/contributions-welcome-brightgreen.svg)

# Subrec

Symbol processing language

For now there will be a lot of POCs to explore language flexibility.

The goal is to emulate all basic/useful/cool features from other languages (libraries, frameworks and platform features are secondary).

# Contributions

Feel free to add cool/niche language to the list and some features you couldn't do without

If you have a clever idea of how to improve the core language

PR or Open Issue

# TODO

- find a better name    ![help](https://img.shields.io/badge/help-needed-brightgreen.svg)

- refactor:
  - ? remove evaluate and inner evaluate - rewrite tests
  - rewrite commented tests
  - refactor tests to use exported consts $
  - pattern-check also with vars
  - better report for pattern-checking
  - change structure
  - test design patterns
  - bootstrap language

# WISHLIST

syntax:
  - fit in somehow python like indentation rules
  - choose a delimiter + escape-character for space-containing/multiline symbols (indentation preserving)

transpiler/interpreter:
  - infere if more efficient copy term or reference it (so garbage collected)
  - infere from substitution rules possible pattern matches into a more local code
  - (no js interpreter) multi core
  - (transpiler only) directly map to native code
  - common cases could be coded into the host language for performance (eg: bit, integer manipulation)

implement other language's cool features:
  - Go, Rust, Haxe
  - JavaScript (TypeScript, Flow, Elm, CoffeeScript), Python, Ruby (Crystal)
  - Java, C#, SmallTalk, ObjectiveC
  - Erlang, Elixir
  - Haskell, OCaml, F#
  - Purescript, ReasonML
  - Clojure, Lisp, Scheme, Racket
  - R, Julia, Matlab
  - Swift, Scala, Lua, Rebol, FORTH, Fortran, Rexx, Perl, Pascal, Algol, Bash, Basic, awk, PHP, Hack, Dart, Kotlin, Tom,
  Visual Basic, VimScript, ASP, Vala, ColdFusion, ActionScript, AppleScript, Prolog, Delphi, Nim, Nemerle, Refal,
  Eiffel, Ada, Logos, Gosu, Apex, Idl, ABL, Lasso, APL, J, ML, Octave, Joy, Cobol, Deplhi, Red, K, LFE,
  Ceylon, ParaSail, Idris, Q, Pure, Genie, Agda, Cobra, Seed7, Boo, Squirrel, Falcon, Factor, Io, D, JoinJava, Jeeves,
  Wren, agora, Lux, gravity, cpython, ponyc, nu, amber, lily, Groovy, FP, FL, Dylan, Algol, Icon, Idol, Unicon,


  - static typing
  - sum, product, union, intersection, invariance and recursive types
  - currying
  - lambdas
  - guards
  - interfaces
  - hygienic macros
  - generics
  - traits
  - parametric polymorphism
  - ad hoc polymorphism
  - multimethods
  - inheritance (for classes, interfaces...)
  - runtime polymorphism
  - row polymorphism
  - symple dsl
  - ADT
  - GADT
  - common data types (eg. number, list, set, dict, map, tuple, bit)
  - seamless async
  - seamless imperative programming
  - seamless error managment (unicon like - using monad rails)
  - seamless lazy evaluation
  - do notatation (from haskell)
  - subtyping
  - threading fibers (go like)
  - must have libraries (date manipulation, JSON manipulation...)
  - effectful non-blocking IO
  - seamless distributed programming (erlang like)
  - list comprehension
  - seamless parallel programming (with some monoid structures)
  - coroutines (python like)
  - programming in the large:
    - documentation (could be lisp like)
    - semantic versioning automatically enforced (elm like)
    - distribution
    - package system
    - namespaces
    - visibility
    - ide suppport

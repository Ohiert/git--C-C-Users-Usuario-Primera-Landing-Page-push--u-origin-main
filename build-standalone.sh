#!/bin/sh
# Genera ecomoney-standalone.html: la portada en un unico archivo, con el CSS
# y el JS incrustados. Se publica como Artifact privado en claude.ai, asi que
# se le quitan las rutas propias del dominio (analitica) y se hacen absolutos
# los enlaces internos.
set -e
cd "$(dirname "$0")"

perl -0777 -ne 'print $1 if m{<body>(.*)</body>}s' index.html \
  | perl -pe 's{^\s*<script src="script\.js"></script>\s*$}{}' \
  | perl -pe 's{^\s*<script defer src="/_vercel/insights/script\.js"></script>\s*$}{}' \
  | perl -pe 's{href="/sobre"}{href="https://eccomoney.vercel.app/sobre"}g' \
  > .body.tmp

{
  printf '%s\n' '<title>Ecomoney</title>'
  printf '%s\n' '<noscript><style>.reveal { opacity: 1; transform: none; }</style></noscript>'
  printf '%s\n' '<style>'
  cat styles.css
  printf '%s\n' '</style>'
  cat .body.tmp
  printf '%s\n' '<script>'
  cat script.js
  printf '%s\n' '</script>'
} > ecomoney-standalone.html

rm -f .body.tmp
echo "ecomoney-standalone.html: $(wc -c < ecomoney-standalone.html) bytes"

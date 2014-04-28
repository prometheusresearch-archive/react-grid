.DELETE_ON_ERROR:
.INTERMEDIATE: react-grid.prod.js

TARGETS = react-grid.js react-grid.min.js

PATH := ../node_modules/.bin:$(PATH)

build: $(TARGETS)

react-grid.js:
	$(call browserify,development)

react-grid.prod.js:
	$(call browserify,production)

react-grid.min.js: react-grid.prod.js
	@cat $< | uglifyjs -cm > $@

clean:
	@rm -f $(TARGETS)

define browserify
	@NODE_ENV=$(1) browserify -t [ reactify --es6] . \
		| sed -E 's/function\(require/function(__browserify__/g' \
		| sed -E 's/require\(/__browserify__(/g' \
		>> $@
endef

# x86reference

Quickly search x86 assembly operation reference. Documentation is extracted from
Intel's official x86 reference using the excellent
[zneak/x86doc](https://github.com/zneak/x86doc), then further parsed into
concise metadata using a modified version of `docenizer.py` (taken from
[compiler-explorer](https://github.com/compiler-explorer/compiler-explorer/blob/b3521cc1ec217db7294316dd919e86876575654a/etc/scripts/docenizer.py)).

## Usage

First, build the documentation data files.

```plain
$ ./docenizer.py
```

This should generate both `autocomplete.json` and `full.json`.

Once this is done, you can run the local development server with

```plain
$ npm run develop
```

You can view the site at [http://localhost:8000](http://localhost:8000).

## Deploying

To deploy the site, first build the assets with

```plain
$ npm run build
```

This will build the site in `public`. Upload the contents of that directory to a
hosting site of your choice and you're good to go.

## License

This project is distributed under the BSD Zero Clause License. Read the full
license [here](./LICENSE).

&copy; 2021 Aaron Ross, all rights reserved.

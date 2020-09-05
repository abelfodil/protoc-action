# protoc-action

This action sets up a protoc environment for use in actions. It works on Linux, Windows, and macOS and includes Dart plugin.

# Usage

```yaml
steps:
  - uses: actions/checkout@v1
  - uses: abelfodil/protoc-action@v1
    with:
      protoc-version: '3.13.0'
      enable-dart: true
      dart-version: '2.9.2'
  - run: protoc -Ipath/to/protos path/to/protos/* --dart-out=path/to/dart/out --js_out=path/to/js/out
```

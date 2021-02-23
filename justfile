help:
    @echo "ThingCo shared frontend libraries"
    @echo "OS family: {{os_family()}}"
    @echo "OS: {{os()}} on {{arch()}}"
    @echo ""
    @just --list

# builds everything
build_all:
    @echo "Building all packages"
    @yarn workspaces foreach --exclude website run build

# builds all libraries, excluding the documentation website
build_all_libraries:
    @echo "Building all packages"
    @yarn workspaces foreach --exclude website run build

# bundles a single package (for example "just build @thingco/dataviz")
build package:
    @echo "Building {{package}}"
    @yarn workspace {{package}} run build

# builds and then watches all libraries, excluding the documentation website
develop_all_libraries:
    @echo "Building and watching all packages"
    @yarn workspaces foreach --exclude website run develop

# tests all packages
test_all:
    @echo "Testing all packages"
    @yarn workspaces foreach run test

# tests a single package (for example "just test @thingco/dataviz")
test package:
    @echo "Testing {{package}}"
    @yarn workspace {{package}} run test




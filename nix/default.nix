let
  pkgs = import <nixpkgs> {};
in
  pkgs.poetry2nix.mkPoetryApplication {
    projectDir = ../.;
    overrides = pkgs.poetry2nix.overrides.withDefaults (self: super: {
      pytest = super.pytest.overrideAttrs (old: {
        postPatch = old.postPatch or "" + ''
          sed -i '/\[metadata\]/aversion = ${old.version}' setup.cfg
          echo "VERSION"
          grep version setup.cfg
        '';
      });
      marisa-trie = super.marisa-trie.overrideAttrs (old: {
        doCheck = false;
      });
    });
  }

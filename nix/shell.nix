let
  pkgs = import <nixpkgs> {};
in
  pkgs.mkShell {
    inputsFrom = [];
    buildInputs = [
      pkgs.pre-commit
      pkgs.python38Packages.virtualenv
    ];
    shellHook = ''
      unset SOURCE_DATE_EPOCH
    '';
  }

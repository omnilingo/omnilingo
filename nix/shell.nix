let
  pkgs = import <nixpkgs> {};
  omnilingo = import ./default.nix;
in
  pkgs.mkShell {
    inputsFrom = [omnilingo];
    buildInputs = [
      pkgs.cmake
      pkgs.gcc
      pkgs.pre-commit
      pkgs.python38Packages.virtualenv
    ];
    shellHook = ''
      unset SOURCE_DATE_EPOCH
    '';
  }

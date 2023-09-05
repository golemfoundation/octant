{
  description = "The decentralised governance system from Golem Foundation";

  inputs = {
    nixpkgs.url = "github:nixos/nixpkgs/23.05";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {nixpkgs, flake-utils, ... }: flake-utils.lib.eachDefaultSystem (system:
    let
      pkgs = import nixpkgs { inherit system; };
      python = pkgs.python311.withPackages (ps: with ps; [
        web3
        pip
        requests
        flask
        pytest
        setuptools

        epc         # for emacs
        importmagic # for emacs
      ]);
      node = pkgs.nodejs-16_x;
      yarn16 = pkgs.yarn.overrideAttrs (finalAttrs: previousAttrs: {
        buildInputs = [ node ];
      });
      darwinInputs = pkgs.lib.optionals pkgs.stdenv.isDarwin [ pkgs.xcbuild ];
    in {
      devShells.default = pkgs.mkShell {
        buildInputs = [
          node
          python
          yarn16
          pkgs.poetry
          pkgs.envsubst
          # (pkgs.poetry.override { python3 = pkgs.python311; })
        ] ++ darwinInputs;
      };
    });
}

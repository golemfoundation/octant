# shell.nix
let
  sources = import ./nix/sources.nix;
  pkgsrg = import sources.nixpkgs-rg {};
  pkgs = import sources.nixpkgs {};
in

pkgs.mkShell {
  buildInputs = [
    pkgs.nodejs
    pkgs.yarn
	  pkgs.git
	  pkgsrg.ripgrep
  ];
}

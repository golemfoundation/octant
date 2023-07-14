# shell.nix
let
  sources = import ./nix/sources.nix;
  pkgs16 = import sources.nixpkgs16 {};
  pkgs = import sources.nixpkgs {};
  yarn16 = pkgs16.yarn.overrideAttrs (finalAttrs: previousAttrs: {
    buildInputs = [ pkgs16.nodejs-16_x ];
  });
in

pkgs.mkShell {
  buildInputs = [
	  pkgs16.nodejs-16_x
    yarn16
	  pkgs.git
	  pkgs.ripgrep
  ];
}

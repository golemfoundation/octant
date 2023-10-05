def build_patron_mode_msg(user_address: str, toggle: bool) -> str:
    toggle_msg = "enable" if toggle else "disable"
    return f"Signing this message will {toggle_msg} patron mode for address {user_address}."

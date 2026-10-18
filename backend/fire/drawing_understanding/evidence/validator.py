def validate_dimensions(doors: list) -> list[str]:
    warnings: list[str] = []
    for door in doors:
        if door.width_m is not None and not 0.4 <= door.width_m <= 3.0:
            warnings.append(f"{door.mark or 'Door'} has an unusual width: {door.width_m} m")
        if door.height_mm is not None and not 1500 <= door.height_mm <= 3500:
            warnings.append(f"{door.mark or 'Door'} has an unusual height: {door.height_mm} mm")
    return warnings

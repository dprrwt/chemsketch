# ⚗️ ChemSketch

**SMILES → Molecular Structure Renderer**

A free online tool for rendering chemical structures from SMILES notation. Perfect for students, researchers, and anyone who needs to visualize molecules without the pain of LaTeX or specialized software.

🔗 **Live Demo:** [https://dprrwt.github.io/chemsketch](https://dprrwt.github.io/chemsketch)

## Features

### 🧪 SMILES Input
Type any valid SMILES notation and see the 2D molecular structure instantly:
- Benzene: `c1ccccc1`
- Ethanol: `CCO`
- Caffeine: `CN1C=NC2=C1C(=O)N(C(=O)N2C)C`
- Aspirin: `CC(=O)Oc1ccccc1C(=O)O`

### 📚 Common Molecules Library
Quick-pick buttons for frequently used molecules:
- Water, Methane, Ammonia, Ethanol
- Benzene, Acetic Acid, Glucose
- Caffeine, Aspirin, Ibuprofen
- Pyrene, Testosterone, and more

### 📤 Export Options
- **Download PNG** — High-quality image for documents
- **Download SVG** — Scalable vector for presentations
- **Copy SVG Code** — Paste directly into code
- **Copy Embed Code** — HTML snippet with image
- **Copy URL** — Share molecules with a link

### 🔗 URL Sharing
Share molecules via URL parameters:
```
https://dprrwt.github.io/chemsketch/?smiles=c1ccccc1&name=Benzene
```

## Usage

### Web Interface
1. Visit [dprrwt.github.io/chemsketch](https://dprrwt.github.io/chemsketch)
2. Enter SMILES notation or click a common molecule
3. Export in your preferred format

### URL Parameters
| Parameter | Description | Example |
|-----------|-------------|---------|
| `smiles` | SMILES notation | `?smiles=CCO` |
| `name` | Molecule name (optional) | `?smiles=CCO&name=Ethanol` |

### Examples
- Benzene: `?smiles=c1ccccc1`
- Caffeine: `?smiles=CN1C%3DNC2%3DC1C(%3DO)N(C(%3DO)N2C)C`
- Aspirin: `?smiles=CC(%3DO)Oc1ccccc1C(%3DO)O`

## SMILES Notation Quick Reference

| Structure | SMILES |
|-----------|--------|
| Single bond | `CC` (ethane) |
| Double bond | `C=C` (ethene) |
| Triple bond | `C#C` (ethyne) |
| Aromatic ring | `c1ccccc1` (benzene) |
| Branch | `CC(C)C` (isobutane) |
| Hydroxyl | `CO` (methanol) |
| Carbonyl | `CC=O` (acetaldehyde) |
| Carboxyl | `CC(=O)O` (acetic acid) |

## Tech Stack

- **Vanilla JavaScript** — No build tools required
- **[SmilesDrawer](https://github.com/reymond-group/smilesDrawer)** — SMILES parsing and rendering
- **HTML5 Canvas** — Molecule visualization
- **CSS3** — Dark theme, responsive design

## Local Development

```bash
# Clone the repository
git clone https://github.com/dprrwt/chemsketch.git
cd chemsketch

# Serve locally (any static server works)
python -m http.server 8000
# or
npx serve .

# Open http://localhost:8000
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License — See [LICENSE](LICENSE) for details.

## Credits

- [SmilesDrawer](https://github.com/reymond-group/smilesDrawer) by Reymond Group
- Built by [dprrwt](https://dprrwt.me)

---

**Made with ⚗️ for scientists and students everywhere.**

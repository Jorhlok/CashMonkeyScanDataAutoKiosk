```markdown
# CashMonkeyData

`CashMonkeyData` is an Electron app designed to fetch CashMonkey listing/prescan data and provide individual user details. The application gathers relevant data from CashMonkey, prescans, and listings, and breaks it down per user for easier analysis.

## Features

- Fetches data from CashMonkey listings and prescans.
- Provides individual user breakdowns.
- Built using Electron for cross-platform support.

## Prerequisites

Before you begin, ensure you have the following tools installed:

- [Node.js](https://nodejs.org/) (>= 16.x)
- [Git](https://git-scm.com/)

## Cloning the Repository

To get started, clone the repository to your local machine:

```bash
git clone https://github.com/MalachiWatkins/CashMonekyScanData
cd CashMonkeyData
```

## Installing Dependencies

Once the repository is cloned, navigate into the project directory and install the required dependencies:

```bash
npm install
```

This will install the dependencies specified in the `package.json` file, such as `axios`, `cheerio`, `dotenv`, and `electron`.

## Environment Configuration

The application requires certain credentials to function properly. These should be stored in a `.env` file located at the following path:

```
/Users/malachiwatkins/Desktop/CashMonekyScanData/buildwin/cmData-win32-x64/resources/app
```

### Required Environment Variables

Add the following variables to your `.env` file, ensuring they are properly configured with your credentials:

```env
LISTER_API_URL='your-lister-api-url'
LISTER_CONTENT_TYPE='your-lister-content-type'
LISTER_COOKIE='your-lister-cookie'
LISTER_ACCEPT='your-lister-accept'

PRESCAN_API_URL='your-prescan-api-url'
PRESCAN_AUTH_TOKEN='your-prescan-auth-token'
PRESCAN_COOKIE='your-prescan-cookie'
PRESCAN_USER_AGENT='your-prescan-user-agent'
```

> **Important**: The credentials are sensitive and **should not be shared**. Make sure to securely handle the `.env` file.

## Running the Application

To run the application in development mode, use the following command:

```bash
npm start
```

This will launch the Electron app, allowing you to interact with the data-fetching functionality.

## Building the Application

You can build the app for different platforms (Windows, Linux, macOS) using the provided scripts. The build output will be placed in the `build` directory.

### Building for Windows

```bash
npm run packwin
```

### Building for Linux

```bash
npm run packlinux
```

### Building for macOS

```bash
npm run packmac
```

### Build Output

The application will be built and saved in the following directories:

- Windows: `buildwin`
- Linux: `buildlinux`
- macOS: `buildmac`

You can distribute the respective platform package (e.g., `.exe`, `.dmg`, `.AppImage`) as needed.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.

---

If you encounter any issues or have questions, feel free to open an issue in the repository or reach out.
```
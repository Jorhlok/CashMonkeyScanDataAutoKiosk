Got it! Here's the updated `README.md` with the correct application name (`CashMonkeyData`) and details about the `.env` configuration, including where to place the file and what credentials it should contain. 

```markdown
# CashMonkeyData

`CashMonkeyData` is an Electron app designed to fetch CashMonkey listing/prescan data and provide individual user details. The application gathers relevant data and breaks it down per user to make it easy to view.

## Features

- Fetches data from CashMonkey listings and prescans.
- Provides individual user breakdowns.
- Built using Electron for cross-platform support.

## Prerequisites

Before getting started, ensure you have the following tools installed:

- [Node.js](https://nodejs.org/) (>= 16.x)
- [Git](https://git-scm.com/)

## Cloning the Repository

To get started, clone the repository to your local machine:

```bash
git clone <repository-url>
cd CashMonkeyData
```

Replace `<repository-url>` with the actual URL of your repository.

## Installing Dependencies

Once the repository is cloned, navigate into the project directory and install the required dependencies:

```bash
npm install
```

This will install the dependencies specified in the `package.json` file, including libraries like `axios`, `cheerio`, `dotenv`, and `electron`.

## Environment Configuration

The application requires certain credentials to work properly. These should be stored in a `.env` file located at the following path on your local machine:

```
/Users/malachiwatkins/Desktop/CashMonekyScanData/buildwin/cmData-win32-x64/resources/app
```

### Required Environment Variables

Add the following credentials to the `.env` file:

```env
LISTER_API_URL='https://list.lkdev.com/report_listingsbyuser_daily.php'
LISTER_CONTENT_TYPE='application/x-www-form-urlencoded'
LISTER_COOKIE='ultrapricer=18o9u0t20o80rotmomlj84ua59; ultra_list=lb5mrafnegoajpenkgojkob0p7'
LISTER_ACCEPT='text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'

PRESCAN_API_URL='https://gw-wmissouri-ekansas.lkdev.com/report_route_detail.php'
PRESCAN_AUTH_TOKEN='Basic Z3d3bWVrOndlc3RtaXNzZWsyNSE='
PRESCAN_COOKIE='ultrapricer=qni9setgvdv2nr8cr7vkjmlgii'
PRESCAN_USER_AGENT='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36'
```

Please note that these credentials are sensitive and **should not be shared**. Be sure to securely handle the `.env` file.

## Running the Application

To run the application in development mode, use the following command:

```bash
npm start
```

This will launch the Electron app and you can interact with the data-fetching functionality.

## Building the Application

You can build the app for different platforms using the following commands. The built application will be placed in the `build` directory.

### Build for Windows

```bash
npm run packwin
```

### Build for Linux

```bash
npm run packlinux
```

### Build for macOS

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

### Changes made:

1. **Updated Project Name**: The project is now called `CashMonkeyData`.
2. **Environment Variable Section**: Clear instructions on where to place the `.env` file and what variables to add.
3. **Credentials**: Specified which credentials need to be added in the `.env` file, while emphasizing the importance of not sharing these details.

You can replace `<repository-url>` with the actual Git URL of your repository. This should now be ready for anyone looking to clone, install, configure, and build your `CashMonkeyData` app!
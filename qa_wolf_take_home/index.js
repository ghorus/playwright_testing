const { chromium } = require("playwright");

async function saveHackerNewsArticles() {
  // Launch browser
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Go to LinkedIn login page
  await page.goto("https://www.linkedin.com/login");
  await page.waitForTimeout(1000);
  // Fill in the username and password
  await page.fill('#username', 'nguyen.victor4@gmail.com');
  await page.waitForTimeout(1000);
  await page.fill('#password', 'STRIKERfall4');
  await page.waitForTimeout(1000);

  // Click the login button
  await page.click('button[type="submit"]');

  // Wait for the navigation to the feed page
  await page.waitForNavigation({ timeout: 280000 });
  await page.waitForTimeout(2000);
  
  //search for software engiener
  await page.fill('.search-global-typeahead__input', 'software engineer');
  await page.waitForTimeout(1000);
  await page.press('.search-global-typeahead__input', 'Enter');
  await page.waitForNavigation({ timeout: 30000 });
  await page.waitForTimeout(1000);

  //search for jobs specificaly
  await page.click(".artdeco-pill.artdeco-pill--slate.artdeco-pill--choice.artdeco-pill--2.search-reusables__filter-pill-button.search-reusables__filter-pill-button")
  await page.waitForNavigation({ timeout: 30000 });
  await page.waitForTimeout(1000);



  //START SEARCHING
  let hasNextPage = true;
  let takeHomes = []
while (hasNextPage){
  console.log('searching...')
  // Ensure the element is visible
  await page.waitForSelector('.jobs-search-results-list', { state: 'visible' });
  await page.waitForTimeout(2000);
  // Function to scroll the element to the bottom and wait for loading
  async function scrollToBottom() {
      let previousHeight;
      let currentHeight = await page.evaluate(() => document.querySelector('.jobs-search-results-list').scrollHeight);

      while (previousHeight !== currentHeight) {
          previousHeight = currentHeight;

          await page.evaluate(() => {
              const element = document.querySelector('.jobs-search-results-list');
              if (element) {
                  element.scrollTop = element.scrollHeight;
              }
          });

          // Wait for new content to load
          await page.waitForTimeout(2000); // Adjust timeout as needed

          currentHeight = await page.evaluate(() => document.querySelector('.jobs-search-results-list').scrollHeight);
      }
  }
  // Scroll to the bottom of the jobs list
  await scrollToBottom();
  await page.waitForTimeout(2000);
  const jobElements = await page.$$('.ember-view.jobs-search-results__list-item.occludable-update.p0.relative.scaffold-layout__list-item');
  const jobCount = jobElements.length;

  // console.log(`Number of job elements: ${jobCount}`);
  // Click each job element
  for (let i = 0; i < jobCount; i++) {
    await jobElements[i].click();

    // Optionally, you can add a wait to ensure the click action is completed
    // and the new page or modal is loaded before proceeding
    await page.waitForTimeout(300); // Adjust the timeout as needed
    // Wait for the job details to be loaded

    await page.waitForSelector('#job-details', { state: 'visible' });
    // Extract text from job-details
    const jobDetailsText = await page.$eval('#job-details', element => element.innerText);
    // Check if the job details contain "software engineer"
  //   if (jobDetailsText.toLowerCase().includes('about the job')) {
  //     const innerHTML = await jobElements[i].$eval('.artdeco-entity-lockup__subtitle.ember-view', element => element.textContent.trim());
  //     console.log(`Company name:`, innerHTML);
  // }
    const takeHomeRegex = /take[-\s]?home|assessment/gi;

    // Check if the job details text matches the regular expression
    if (takeHomeRegex.test(jobDetailsText)) {
      const innerHTML = await jobElements[i].$eval('.artdeco-entity-lockup__subtitle.ember-view', element => element.textContent.trim());
      takeHomes.push(innerHTML)
  }
  }


  hasNextPage = await page.$('.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view.jobs-search-pagination__button.jobs-search-pagination__button--next');

  if (hasNextPage) {
      // Click the next page button
      await page.click('.artdeco-button.artdeco-button--muted.artdeco-button--icon-right.artdeco-button--1.artdeco-button--tertiary.ember-view.jobs-search-pagination__button.jobs-search-pagination__button--next');
      await page.waitForNavigation({ timeout: 30000 });
      console.log(`Still looking... Companies that do take homes so far...:`,takeHomes);
  }
  else {
    // Close the browser if there isn't a next page
    await browser.close();
    console.log(`Task done. Companies that do take homes:`,takeHomes);
}
}
}

(async () => {
  await saveHackerNewsArticles();
})();
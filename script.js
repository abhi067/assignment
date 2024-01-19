let itemsPerPage = 10;
let currentPage = 1;
let user = null; // to store user profile information

async function getRepositories() {
  const username = document.getElementById('username').value;
  const userProfileElement = document.getElementById('userProfile');
  const repoListElement = document.getElementById('repoList');
  const paginationElement = document.getElementById('pagination');
  const loaderElement = document.getElementById('loader');
  const getRepositoriesBtn = document.getElementById('getRepositoriesBtn');

  try {
    //  it will show loader while API call is in progress
    loaderElement.style.display = 'block';

    // to fetch user profile information
    const userResponse = await fetch(`https://api.github.com/users/${username}`);
    user = await userResponse.json();

    // to display user profile information
    userProfileElement.innerHTML = `
      <div id="userProfile">
        <img src="${user.avatar_url}" alt="${user.login} profile picture">
        <div id="profileDetails">
          <p><strong>${user.name}</strong></p>
          <p><strong>Username:</strong> ${user.login}</p>
          <p><strong>Profile Link:</strong> <a href="${user.html_url}" target="_blank">${user.html_url}</a></p>
        </div>
      </div>
    `;

    // it will fetch repositories
    const repoResponse = await fetch(`https://api.github.com/users/${username}/repos`);
    const repos = await repoResponse.json();

    // Calculate pagination values
    const totalItems = repos.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // Display repositories for the current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const displayedRepos = repos.slice(startIndex, endIndex);

    // clear previous results
    repoListElement.innerHTML = '';

    displayedRepos.forEach(repo => {
      const repoBox = document.createElement('div');
      repoBox.classList.add('repoBox');

      const languagesContainer = document.createElement('div');
      languagesContainer.classList.add('languagesContainer');

      if (repo.language) {
        const languageBox = document.createElement('div');
        languageBox.classList.add('languageBox');
        languageBox.textContent = repo.language;
        languagesContainer.appendChild(languageBox);
      }

      // Add up to 2 more languages
      repo.languages?.slice(0, 2).forEach(language => {
        const languageBox = document.createElement('div');
        languageBox.classList.add('languageBox');
        languageBox.textContent = language;
        languagesContainer.appendChild(languageBox);
      });

      repoBox.innerHTML = `
        <h3>${repo.name}</h3>
        <p><strong>Description:</strong> ${repo.description || 'Not available'}</p>
        <div class="languagesContainer">${languagesContainer.innerHTML}</div>
      `;

      repoListElement.appendChild(repoBox);
    });

    // Display server-side pagination controls
    renderPaginationControls(totalPages);

    
  } catch (error) {
    console.error('Error fetching data:', error.message);
    userProfileElement.innerHTML = '<p>Error fetching user data</p>';
    repoListElement.innerHTML = '<p>Error fetching repositories</p>';
    paginationElement.innerHTML = '';
  } finally {
    // Hide loader when API call is complete
    loaderElement.style.display = 'none';
  }
}

function renderPaginationControls(totalPages) {
  const paginationElement = document.getElementById('pagination');
  paginationElement.innerHTML = '';

  const itemsPerPageLabel = document.createElement('label');
  itemsPerPageLabel.textContent = 'Repositories per page:';
  paginationElement.appendChild(itemsPerPageLabel);

  const itemsPerPageSelect = document.createElement('select');
  itemsPerPageSelect.addEventListener('change', (event) => {
    itemsPerPage = parseInt(event.target.value);
    currentPage = 1;
    getRepositories();
  });

  for (let i = 10; i <= 100; i += 1) {
    const option = document.createElement('option');
    option.value = i;
    option.textContent = i;
    itemsPerPageSelect.appendChild(option);
  }

  itemsPerPageSelect.value = itemsPerPage;
  paginationElement.appendChild(itemsPerPageSelect);

  for (let i = 1; i <= totalPages; i++) {
    const button = document.createElement('button');
    button.textContent = i;
    button.addEventListener('click', () => {
      currentPage = i;
      getRepositories();
    });
    paginationElement.appendChild(button);
  }
}

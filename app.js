(function() {
  // Full-time security roles only — internships are deliberately excluded.
  // Open-ended range (null) counts through today, so this never goes stale.
  var yearsEl = document.getElementById('years-exp');
  if (yearsEl) {
    var roles = [
      ['2020-08', '2022-08'], // Willis Towers Watson
      ['2024-07', '2024-10'], // DVIs Software Services
      ['2024-10', null] // Galaxy Digital
    ];
    var now = new Date();
    var months = roles.reduce(function(total, role) {
      var from = role[0].split('-');
      var to = role[1] ? role[1].split('-') : null;
      var toYear = to ? Number(to[0]) : now.getFullYear();
      var toMonth = to ? Number(to[1]) : now.getMonth() + 1;
      return total + (toYear - Number(from[0])) * 12 +
        (toMonth - Number(from[1]));
    }, 0);
    yearsEl.textContent = Math.floor(months / 12) + '+';
  }

  var searchInput = document.getElementById('search-posts');
  var noResults = document.getElementById('no-results');
  var posts = document.querySelectorAll('.post');

  // Titles wrap across lines in the source, so textContent carries newlines and
  // indentation. Collapsing runs of whitespace is what lets a query spanning a
  // line break ("an sql injection primer") still match.
  function normalizeText(str) {
    return str.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim();
  }

  if (searchInput && noResults && posts.length) {
    var index = Array.prototype.map.call(posts, function(post) {
      return { el: post, text: normalizeText(post.textContent) };
    });

    searchInput.addEventListener('input', function(e) {
      var query = normalizeText(e.target.value);
      var visibleCount = 0;

      index.forEach(function(entry) {
        if (query === '' || entry.text.indexOf(query) !== -1) {
          entry.el.style.display = '';
          visibleCount++;
        } else {
          entry.el.style.display = 'none';
        }
      });

      noResults.style.display = visibleCount === 0 ? 'block' : 'none';
    });
  }
})();

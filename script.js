document.addEventListener('DOMContentLoaded', function () {

    // ======== NEXT / PREV SLIDER (slidy) with AUTO =========
    function setupSlidy() {
        const slides = document.querySelectorAll('.itm');
        const nextBtn = document.querySelector('.btn-next');
        const prevBtn = document.querySelector('.btn-prev');
        let current = 0;
        let autoSlideInterval;

        function updateSlides() {
            slides.forEach((slide, i) => {
                slide.classList.remove('active', 'prev', 'next');
                if (i === current) {
                    slide.classList.add('active');
                } else if (i === (current - 1 + slides.length) % slides.length) {
                    slide.classList.add('prev');
                } else if (i === (current + 1) % slides.length) {
                    slide.classList.add('next');
                }
            });
        }

        function showNext() {
            current = (current + 1) % slides.length;
            updateSlides();
        }

        function showPrev() {
            current = (current - 1 + slides.length) % slides.length;
            updateSlides();
        }

        function startAutoSlide() {
            autoSlideInterval = setInterval(showNext, 8000);
        }

        function stopAutoSlide() {
            clearInterval(autoSlideInterval);
        }

        function resetAutoSlide() {
            stopAutoSlide();
            startAutoSlide();
        }

        if (nextBtn && prevBtn) {
            nextBtn.addEventListener('click', () => { showNext(); resetAutoSlide(); });
            prevBtn.addEventListener('click', () => { showPrev(); resetAutoSlide(); });
        }

        const slider = document.querySelector('.slidy');
        slider.addEventListener('mouseenter', stopAutoSlide);
        slider.addEventListener('mouseleave', startAutoSlide);

        updateSlides();
        startAutoSlide();
    }

    // ======== BBC RSS FEED =========
    function loadNewsFeed() {
        fetch('https://api.rss2json.com/v1/api.json?rss_url=http://feeds.bbci.co.uk/news/rss.xml')
            .then(res => res.json())
            .then(data => {
                let headlines = data.items.map(item => `<span>${item.title}</span>`).join("");
                // Duplicate once for seamless loop
                document.getElementById("news-ribbon").innerHTML = `
                <div class="news-track">${headlines}${headlines}</div>
            `;
            })
            .catch(err => console.error(err));
    }

    // ======== CLOCK =========
    function setupClock() {
        const TIME_OPTS = { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const DATE_OPTS = { weekday: 'short', year: 'numeric', month: 'short', day: '2-digit' };

        function tick() {
            const now = new Date();
            document.getElementById('clock-time').textContent = now.toLocaleTimeString(undefined, TIME_OPTS);
            document.getElementById('clock-date').textContent = now.toLocaleDateString(undefined, DATE_OPTS);
        }

        tick();
        setInterval(tick, 1000);
    }

    // ======== NAV LINK HIGHLIGHTING =========
    function setupNavHighlighting() {
        const sections = document.querySelectorAll('main section[id]');
        const navLinks = document.querySelectorAll('.side-nav nav ul li a');

        function updateActiveNav() {
            const scrollPos = window.scrollY || window.pageYOffset;
            if (scrollPos < 900) {
                navLinks.forEach(link => link.classList.toggle('active', link.href.endsWith('#main')));
                return;
            }

            sections.forEach(section => {
                const top = section.offsetTop + 800;
                const bottom = top + section.offsetHeight;
                if (scrollPos >= top && scrollPos < bottom) {
                    navLinks.forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${section.id}`));
                }
            });
        }

        window.addEventListener('scroll', updateActiveNav);
        navLinks.forEach(link => link.classList.toggle('active', link.href.endsWith('#main')));
    }


    // ======== SCROLL-TO-BOTTOM TOGGLE =========
    function setupScrollButton() {
        let scrolling = false;
        let rafId;

        function smoothScrollStep() {
            const target = document.body.scrollHeight - window.innerHeight;
            if (scrolling && window.scrollY < target) {
                window.scrollBy(0, 15);
                rafId = requestAnimationFrame(smoothScrollStep);
            }
        }

        const scrollBtn = document.getElementById("scroll-bottom-btn");
        if (scrollBtn) {
            scrollBtn.addEventListener("click", () => {
                scrolling = !scrolling;
                scrollBtn.textContent = scrolling ? "Stop" : "Start";
                if (scrolling) {
                    smoothScrollStep();
                } else {
                    cancelAnimationFrame(rafId);
                }
            });

            window.addEventListener("scroll", () => {
                const nearBottom = window.scrollY >= document.body.scrollHeight - window.innerHeight - 200;
                scrollBtn.style.display = nearBottom ? "none" : "block";
                if (nearBottom) {
                    scrolling = false;
                    scrollBtn.textContent = "Start";
                    cancelAnimationFrame(rafId);
                }
            });
        }
    }

    // ======== IMAGE SLIDER UNDER EDUCATION ITEMS =========
    function setupEducationSliders() {
        document.querySelectorAll('.edu-slider').forEach(slider => {
            const images = slider.querySelectorAll('img');
            let index = 0;
            let intervalId;

            function showNextImage() {
                images[index].classList.remove('active');
                index = (index + 1) % images.length;
                images[index].classList.add('active');
            }

            if (images.length > 0) {
                images[0].classList.add('active');
                intervalId = setInterval(showNextImage, 8000);

                slider.addEventListener('mouseenter', () => {
                    clearInterval(intervalId);
                });

                slider.addEventListener('mouseleave', () => {
                    intervalId = setInterval(showNextImage, 8000);
                });
            }
        });
    }

    function setupProjectSliders() {
        const projects = document.querySelectorAll('.projects');
        const screen = document.getElementById('screen');
        const screenImg = screen.querySelector('img');
        const closeBtn = screen.querySelector('.close');
        const prevBtn = screen.querySelector('.prev');
        const nextBtn = screen.querySelector('.next');

        let images = [];
        let currentIndex = 0;

        projects.forEach(project => {
            const btn = project.querySelector('.toggle-btn');
            const projectImages = Array.from(project.querySelectorAll('.item img'));

            btn.addEventListener('click', () => {
                if (projectImages.length === 0) return;
                images = projectImages;
                currentIndex = 0;
                screenImg.src = images[currentIndex].src;

                screen.style.display = 'flex';
                screen.classList.remove('hide');
                screen.classList.add('show');
            });
        });

        function closeScreen() {
            screen.classList.remove('show');
            screen.classList.add('hide');
            screen.addEventListener('animationend', function handler() {
                screen.style.display = 'none';
                screen.removeEventListener('animationend', handler);
            });
        }

        closeBtn.addEventListener('click', closeScreen);
        screen.addEventListener('click', (e) => { if (e.target === screen) closeScreen(); });

        function changeImage(index, direction) {
            if (!images.length) return;

            // add outgoing class
            screenImg.classList.add(direction === 'prev' ? 'slide-out-prev' : 'slide-out-next');

            setTimeout(() => {
                screenImg.src = images[index].src;
                screenImg.classList.remove('slide-out-prev', 'slide-out-next');
                screenImg.classList.add('slide-in');

                setTimeout(() => {
                    screenImg.classList.remove('slide-in'); // reset for next transition
                }, 300);

            }, 300); // matches transition duration
        }

        prevBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex - 1 + images.length) % images.length;
            changeImage(currentIndex, 'prev');
        });

        nextBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            currentIndex = (currentIndex + 1) % images.length;
            changeImage(currentIndex, 'next');
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && screen.style.display === 'flex') closeScreen();
        });
    }


    // ======== SKILL BARS ANIMATION (with count-up) =========
    function setupSkillBars() {
        const skillsSection = document.querySelector("#skills");
        const bars = document.querySelectorAll(".fill");

        const animateBar = (bar, index) => {
            const finalWidth = bar.getAttribute("data-width");
            const percentSpan = bar.querySelector(".percent");
            const targetValue = parseInt(finalWidth, 10);

            percentSpan.textContent = "0%";
            bar.style.width = "0";

            setTimeout(() => {
                bar.style.width = finalWidth;

                let current = 0;
                const duration = 800;
                const stepTime = 20;
                const steps = duration / stepTime;
                const increment = targetValue / steps;

                const interval = setInterval(() => {
                    current += increment;
                    if (current >= targetValue) {
                        current = targetValue;
                        clearInterval(interval);
                    }
                    percentSpan.textContent = Math.round(current) + "%";
                }, stepTime);
            }, index * 100);
        };

        const resetBars = () => {
            bars.forEach(bar => {
                bar.style.width = "0";
                bar.querySelector(".percent").textContent = "0%";
            });
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    bars.forEach((bar, i) => animateBar(bar, i));
                } else {
                    resetBars();
                }
            });
        }, { threshold: 0.2 });

        observer.observe(skillsSection);
    }

    // ======== Hover + Click Projects =========
    function enableItemClickEffect(selector, containerSelector = '.list') {
        const items = document.querySelectorAll(selector);
        const container = document.querySelector(containerSelector);
        let deactivateTimer = null;

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation(); // prevent bubbling

                // If already active → collapse immediately
                if (item.classList.contains('active')) {
                    item.classList.remove('active');
                    clearTimeout(deactivateTimer);
                    return;
                }

                // Remove active from others
                items.forEach(i => i.classList.remove('active'));
                clearTimeout(deactivateTimer);

                // Add active to clicked one
                item.classList.add('active');

                // ✅ Auto deactivate after 10s
                deactivateTimer = setTimeout(() => {
                    item.classList.remove('active');
                }, 10000);
            });
        });

        // ✅ Collapse when clicking outside the container
        document.addEventListener('click', (e) => {
            if (!container.contains(e.target)) {
                items.forEach(i => i.classList.remove('active'));
                clearTimeout(deactivateTimer);
            }
        });
    }

    // ======== INIT ALL =========
    setupSlidy();
    loadNewsFeed();
    setupClock();
    setupNavHighlighting();
    setupScrollButton();
    setupProjectSliders();
    setupEducationSliders();
    setupSkillBars();
    enableItemClickEffect('.list .item');

    document.getElementById('brush').addEventListener('click', function () {
        document.documentElement.classList.toggle('light-theme');
    });
});
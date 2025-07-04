document.addEventListener("DOMContentLoaded", () => {
    // --- DOM Elements ---
    // Views
    const dashboardView = document.getElementById("dashboard-view");
    const filmDetailView = document.getElementById("film-detail-view");

    // Dashboard Elements
    const filmsGrid = document.getElementById("films-grid");
    const noFilmsMessage = document.getElementById("noFilmsMessage");
    const createFilmBtn = document.getElementById("createFilmBtn");

    // Film Detail Elements
    const backToDashboardBtn = document.getElementById("backToDashboardBtn");
    const filmDetailTitle = document.getElementById("filmDetailTitle");
    const sceneCountProgress = document.getElementById("sceneCountProgress");
    const completionPercentage = document.getElementById("completionPercentage");
    const progressBar = document.getElementById("progressBar");
    const scenesListContainer = document.getElementById("scenesListContainer");
    const noScenesMessage = document.getElementById("noScenesMessage");
    const addSceneBtn = document.getElementById("addSceneBtn"); // Button on film detail view

    // Modals
    const createFilmModal = document.getElementById("createFilmModal");
    const createFilmForm = document.getElementById("createFilmForm");
    const filmNameInput = document.getElementById("filmName");
    const filmDescriptionInput = document.getElementById("filmDescription");

    const addSceneModal = document.getElementById("addSceneModal");
    const addSceneForm = document.getElementById("addSceneForm");
    const sceneNameInput = document.getElementById("sceneNameInput");
    const sceneDescriptionInput = document.getElementById("sceneDescriptionInput"); // New: Scene description

    const shotModal = document.getElementById("shotModal");
    const shotModalTitle = document.getElementById("shotModalTitle");
    const shotForm = document.getElementById("shotForm");
    const editShotIdInput = document.getElementById("editShotId");
    const shotModalFilmIdInput = (document = document.getElementById("shotModalFilmId"));
    const shotModalSceneIdInput = document.getElementById("shotModalSceneId");
    const shotNameInput = document.getElementById("shotNameInput");
    const shotDescriptionInput = document.getElementById("shotDescription");
    const shotSizeSelect = document.getElementById("shotSize");
    const shotTypeSelect = document.getElementById("shotType");
    const cameraMovementSelect = document.getElementById("cameraMovement");
    const equipmentSelect = document.getElementById("equipment");
    const lensSelect = document.getElementById("lens");
    const customLensInput = document.getElementById("customLens");
    const lightingOptionsDiv = document.getElementById("lightingOptions");
    const depthOfFieldSelect = document.getElementById("depthOfField");
    const frameRateSelect = document.getElementById("frameRate");
    const aspectRatioSelect = document.getElementById("aspectRatio");
    const saveShotBtn = document.getElementById("saveShotBtn");

    const closeButtons = document.querySelectorAll(".close-button");
    const resetDataBtn = document.getElementById("resetDataBtn");

    // --- Global Variables ---
    let films = []; // Array to store all film data
    let currentFilmId = null; // To keep track of the currently viewed film

    // --- Helper Functions ---

    const generateUniqueId = () => "_" + Math.random().toString(36).substr(2, 9);

    const saveFilms = () => {
        localStorage.setItem("shotStackData", JSON.stringify(films));
    };

    const loadFilms = () => {
        const storedFilms = localStorage.getItem("shotStackData");
        if (storedFilms) {
            films = JSON.parse(storedFilms);
        }
    };

    const openModal = (modal) => {
        modal.style.display = "flex";
    };

    const closeModal = (modal) => {
        modal.style.display = "none";
        if (modal.id === "shotModal") {
            shotForm.reset();
            customLensInput.classList.add("hidden");
            document
                .querySelectorAll('#lightingOptions input[type="checkbox"]')
                .forEach((checkbox) => (checkbox.checked = false));
            editShotIdInput.value = "";
            shotModalFilmIdInput.value = "";
            shotModalSceneIdInput.value = "";
            saveShotBtn.textContent = "Add Shot";
            shotModalTitle.textContent = "Add New Shot";
            shotNameInput.value = ""; // Clear shot name
        } else if (modal.id === "addSceneModal") {
            addSceneForm.reset();
            addSceneForm.dataset.mode = "add"; // Reset mode to 'add' for next time
            addSceneForm.dataset.filmId = "";
            addSceneForm.dataset.sceneId = "";
        }
    };

    // MODIFIED: Function to reset all data
    const resetAllData = () => {
        // Changed to const for consistency
        if (
            confirm(
                "WARNING: Are you absolutely sure you want to delete ALL your films and scenes? This action cannot be undone."
            )
        ) {
            localStorage.removeItem("shotStackData"); // Corrected localStorage key
            films = []; // Reset the in-memory films array
            renderDashboard(); // Corrected function name to match your code
            alert("All film data has been reset.");
            showView(dashboardView); // Ensure we are on the dashboard view
        }
    };

    // Event Listener for the Reset Button - Ensure this is correctly inside DOMContentLoaded
    if (resetDataBtn) {
        resetDataBtn.addEventListener("click", resetAllData);
    }

    // --- UI Navigation ---
    const showView = (viewToShow) => {
        dashboardView.classList.remove("active-view");
        dashboardView.classList.add("hidden-view");
        filmDetailView.classList.remove("active-view");
        filmDetailView.classList.add("hidden-view");

        viewToShow.classList.remove("hidden-view");
        viewToShow.classList.add("active-view");
    };

    // --- Render Functions ---

    const renderDashboard = () => {
        filmsGrid.innerHTML = "";
        if (films.length === 0) {
            noFilmsMessage.classList.remove("hidden");
        } else {
            noFilmsMessage.classList.add("hidden");
            films.forEach((film) => {
                const filmChip = document.createElement("div");
                filmChip.classList.add("film-chip");
                filmChip.textContent = film.name;
                filmChip.dataset.filmId = film.id;
                filmsGrid.appendChild(filmChip);

                filmChip.addEventListener("click", () => {
                    currentFilmId = film.id;
                    renderFilmDetail(film.id);
                    showView(filmDetailView);
                });
            });
        }
    };

    const renderFilmDetail = (filmId) => {
        const film = films.find((f) => f.id === filmId);
        if (!film) {
            console.error("Film not found:", filmId);
            showView(dashboardView); // Go back to dashboard if film not found
            return;
        }

        filmDetailTitle.textContent = film.name;
        scenesListContainer.innerHTML = ""; // Clear existing scenes, except the addSceneBtn which is outside the dynamic list
        scenesListContainer.prepend(noScenesMessage); // Ensure message is there if no scenes
        scenesListContainer.appendChild(addSceneBtn); // Ensure button is always at the bottom

        // Calculate progress
        const totalScenes = film.scenes.length;
        const completedScenes = film.scenes.filter((scene) => scene.isCompleted).length;
        const completionPercentageValue = totalScenes === 0 ? 0 : Math.round((completedScenes / totalScenes) * 100);

        sceneCountProgress.textContent = `${completedScenes}/${totalScenes} SCENES`;
        completionPercentage.textContent = `${completionPercentageValue}% Complete`;
        progressBar.style.width = `${completionPercentageValue}%`;

        if (totalScenes === 0) {
            noScenesMessage.classList.remove("hidden");
        } else {
            noScenesMessage.classList.add("hidden");
            // Create a temporary div to hold scene cards to append before the addSceneBtn
            const sceneCardsDiv = document.createElement("div");
            film.scenes.forEach((scene) => {
                const sceneCard = document.createElement("div");
                sceneCard.classList.add("scene-card");
                sceneCard.dataset.filmId = film.id;
                sceneCard.dataset.sceneId = scene.id;

                const shotsCount = scene.shots ? scene.shots.length : 0;

                sceneCard.innerHTML = `
                    <div class="scene-checkbox-wrapper">
                        <input type="checkbox" data-film-id="${film.id}" data-scene-id="${scene.id}" ${
                    scene.isCompleted ? "checked" : ""
                }>
                    </div>
                    <div class="scene-header-line">
                        <h3 class="scene-title-toggle" data-scene-id="${scene.id}">${
                    scene.name || "Untitled Scene"
                }</h3>
                        <div class="scene-meta">
                            <span class="shots-count">Shots: ${shotsCount}</span>
                        </div>
                    </div>
                    <p class="scene-description">${scene.description || "No description."}</p>
                    <div class="scene-actions-row">
                        <button class="add-shot-btn primary-button" data-film-id="${film.id}" data-scene-id="${
                    scene.id
                }">+ Add Shot</button>
                        <button class="edit-scene-btn primary-button" data-film-id="${film.id}" data-scene-id="${
                    scene.id
                }"><i class="fas fa-pencil-alt"></i></button>
                        <button class="delete-scene-btn primary-button" data-film-id="${film.id}" data-scene-id="${
                    scene.id
                }"><i class="fas fa-trash-alt"></i></button>
                    </div>
                    <ul class="shots-list" id="shots-list-${scene.id}">
                        </ul>
                `;
                sceneCardsDiv.appendChild(sceneCard);

                // Render shots for this scene
                const sceneShotsList = sceneCard.querySelector(`#shots-list-${scene.id}`);
                if (shotsCount === 0) {
                    sceneShotsList.innerHTML = `<li class="no-shots-message">No shots in this scene yet.</li>`;
                } else {
                    scene.shots.forEach((shot) => {
                        const shotLi = document.createElement("li");
                        shotLi.classList.add("shot-item");
                        shotLi.dataset.shotId = shot.id;
                        shotLi.dataset.sceneId = scene.id;
                        shotLi.dataset.filmId = film.id;

                        const lightingText =
                            shot.lighting && shot.lighting.length > 0 ? shot.lighting.join(", ") : "N/A";
                        const customLensText =
                            shot.lens === "Custom" ? `Custom: ${shot.customLens || "N/A"}` : shot.lens || "N/A";

                        shotLi.innerHTML = `
                            <h5>${shot.name || "Untitled Shot"}</h5>
                            <div class="shot-item-details">
                                <p><strong>Description:</strong> ${shot.description || "N/A"}</p>
                                <p><strong>Size:</strong> ${shot.shotSize || "N/A"}</p>
                                <p><strong>Type:</strong> ${shot.shotType || "N/A"}</p>
                                <p><strong>Movement:</strong> ${shot.cameraMovement || "N/A"}</p>
                                <p><strong>Equipment:</strong> ${shot.equipment || "N/A"}</p>
                                <p><strong>Lens:</strong> ${customLensText}</p>
                                <p><strong>Lighting:</strong> ${lightingText}</p>
                                <p><strong>Depth of Field:</strong> ${shot.depthOfField || "N/A"}</p>
                                <p><strong>Frame Rate:</strong> ${shot.frameRate || "N/A"}</p>
                                <p><strong>Aspect Ratio:</strong> ${shot.aspectRatio || "N/A"}</p>
                            </div>
                            <div class="shot-item-actions">
                                <button class="edit-shot-btn primary-button" data-film-id="${film.id}" data-scene-id="${
                            scene.id
                        }" data-shot-id="${shot.id}">Edit</button>
                                <button class="delete-shot-btn primary-button" data-film-id="${
                                    film.id
                                }" data-scene-id="${scene.id}" data-shot-id="${shot.id}">Delete</button>
                            </div>
                        `;
                        sceneShotsList.appendChild(shotLi);
                    });
                }
            });
            scenesListContainer.insertBefore(sceneCardsDiv, addSceneBtn); // Insert scene cards before the add scene button
        }
        attachDynamicEventListeners();
    };

    // --- Dynamic Event Listeners ---
    const attachDynamicEventListeners = () => {
        // Scene Title Toggle (Expand/Collapse Shots)
        document.querySelectorAll(".scene-title-toggle").forEach((title) => {
            title.onclick = null; // Prevent multiple listeners
            title.addEventListener("click", (e) => {
                const sceneId = e.target.dataset.sceneId;
                const shotsList = document.getElementById(`shots-list-${sceneId}`);
                if (shotsList) {
                    shotsList.classList.toggle("expanded");
                    title.classList.toggle("expanded"); // Toggle arrow indicator
                }
            });
        });

        // Scene Checkbox
        document.querySelectorAll('.scene-checkbox-wrapper input[type="checkbox"]').forEach((checkbox) => {
            checkbox.onchange = null;
            checkbox.addEventListener("change", (e) => {
                const filmId = e.target.dataset.filmId;
                const sceneId = e.target.dataset.sceneId;
                toggleSceneCompletion(filmId, sceneId, e.target.checked);
            });
        });

        // Add Shot buttons
        document.querySelectorAll(".add-shot-btn").forEach((button) => {
            button.onclick = null;
            button.addEventListener("click", (e) => {
                const filmId = e.target.dataset.filmId;
                const sceneId = e.target.dataset.sceneId;

                shotModalFilmIdInput.value = filmId;
                shotModalSceneIdInput.value = sceneId;

                shotForm.reset();
                customLensInput.classList.add("hidden");
                document
                    .querySelectorAll('#lightingOptions input[type="checkbox"]')
                    .forEach((checkbox) => (checkbox.checked = false));
                editShotIdInput.value = "";
                saveShotBtn.textContent = "Add Shot";
                shotModalTitle.textContent = "Add New Shot";

                // Pre-fill shot name with "Shot X" for new shots
                const film = films.find((f) => f.id === filmId);
                const scene = film ? film.scenes.find((s) => s.id === sceneId) : null;
                if (scene) {
                    const nextShotNumber = scene.shots.length + 1;
                    shotNameInput.value = `Shot ${nextShotNumber}`;
                } else {
                    shotNameInput.value = "";
                }
                openModal(shotModal);
            });
        });

        // Edit Shot buttons
        document.querySelectorAll(".edit-shot-btn").forEach((button) => {
            button.onclick = null;
            button.addEventListener("click", (e) => {
                const filmId = e.target.dataset.filmId;
                const sceneId = e.target.dataset.sceneId;
                const shotId = e.target.dataset.shotId;
                populateShotForm(filmId, sceneId, shotId);
            });
        });

        // Delete Shot buttons
        document.querySelectorAll(".delete-shot-btn").forEach((button) => {
            button.onclick = null;
            button.addEventListener("click", (e) => {
                const filmId = e.target.dataset.filmId;
                const sceneId = e.target.dataset.sceneId;
                const shotId = e.target.dataset.shotId;
                deleteShot(filmId, sceneId, shotId);
            });
        });

        // Edit Scene button
        document.querySelectorAll(".edit-scene-btn").forEach((button) => {
            button.onclick = null;
            button.addEventListener("click", (e) => {
                const filmId = e.target.dataset.filmId;
                const sceneId = e.target.dataset.sceneId;
                populateSceneForm(filmId, sceneId);
            });
        });

        // Delete Scene buttons
        document.querySelectorAll(".delete-scene-btn").forEach((button) => {
            button.onclick = null;
            button.addEventListener("click", (e) => {
                const filmId = e.target.dataset.filmId;
                const sceneId = e.target.dataset.sceneId;
                deleteScene(filmId, sceneId);
            });
        });
    };

    // --- Data Management Functions ---

    // Create Film
    const createFilm = (name, description) => {
        const newFilm = {
            id: generateUniqueId(),
            name: name,
            description: description,
            scenes: [],
        };
        films.push(newFilm);
        saveFilms();
        renderDashboard();
        closeModal(createFilmModal);
    };

    // Delete Film
    const deleteFilm = (filmId) => {
        if (confirm("Are you sure you want to delete this film and all its scenes/shots?")) {
            films = films.filter((film) => film.id !== filmId);
            saveFilms();
            currentFilmId = null; // Reset current film if it was deleted
            renderDashboard();
            showView(dashboardView); // Always return to dashboard after deleting a film
        }
    };

    // Add Scene
    const addScene = (filmId, sceneName, sceneDescription) => {
        const film = films.find((f) => f.id === filmId);
        if (film) {
            const newScene = {
                id: generateUniqueId(),
                name: sceneName,
                description: sceneDescription, // Save description
                isCompleted: false, // New: Scene completion status
                shots: [],
            };
            film.scenes.push(newScene);
            saveFilms();
            renderFilmDetail(filmId);
            closeModal(addSceneModal);
        }
    };

    // Update Scene (for editing scene details)
    const updateScene = (filmId, sceneId, newName, newDescription) => {
        const film = films.find((f) => f.id === filmId);
        if (film) {
            const scene = film.scenes.find((s) => s.id === sceneId);
            if (scene) {
                scene.name = newName;
                scene.description = newDescription;
                saveFilms();
                renderFilmDetail(filmId);
                closeModal(addSceneModal); // Re-use addSceneModal for editing
            }
        }
    };

    // Populate Scene Form (for editing)
    const populateSceneForm = (filmId, sceneId) => {
        const film = films.find((f) => f.id === filmId);
        const scene = film ? film.scenes.find((s) => s.id === sceneId) : null;

        if (scene) {
            sceneNameInput.value = scene.name || "";
            sceneDescriptionInput.value = scene.description || "";
            addSceneForm.dataset.mode = "edit"; // Set mode for submission handler
            addSceneForm.dataset.filmId = filmId;
            addSceneForm.dataset.sceneId = sceneId;
            addSceneModal.querySelector(".modal-title").textContent = "Edit Scene";
            addSceneModal.querySelector('button[type="submit"]').textContent = "Update Scene";
            openModal(addSceneModal);
        }
    };

    // Delete Scene
    const deleteScene = (filmId, sceneId) => {
        if (confirm("Are you sure you want to delete this scene and all its shots?")) {
            const film = films.find((f) => f.id === filmId);
            if (film) {
                film.scenes = film.scenes.filter((scene) => scene.id !== sceneId);
                saveFilms();
                renderFilmDetail(filmId);
            }
        }
    };

    // Toggle Scene Completion
    const toggleSceneCompletion = (filmId, sceneId, isChecked) => {
        const film = films.find((f) => f.id === filmId);
        if (film) {
            const scene = film.scenes.find((s) => s.id === sceneId);
            if (scene) {
                scene.isCompleted = isChecked;
                saveFilms();
                renderFilmDetail(filmId); // Re-render to update progress bar
            }
        }
    };

    // Add or Update Shot
    const addOrUpdateShot = () => {
        const shotId = editShotIdInput.value;
        const filmId = shotModalFilmIdInput.value;
        const sceneId = shotModalSceneIdInput.value;

        const name = shotNameInput.value.trim();
        const description = shotDescriptionInput.value.trim();
        const shotSize = shotSizeSelect.value;
        const shotType = shotTypeSelect.value;
        const cameraMovement = cameraMovementSelect.value;
        const equipment = equipmentSelect.value;
        let lens = lensSelect.value;
        const customLens = lens === "Custom" ? customLensInput.value.trim() : "";

        const lighting = Array.from(lightingOptionsDiv.querySelectorAll('input[type="checkbox"]:checked')).map(
            (cb) => cb.value
        );
        const depthOfField = depthOfFieldSelect.value;
        const frameRate = frameRateSelect.value;
        const aspectRatio = aspectRatioSelect.value;

        const shotData = {
            id: shotId || generateUniqueId(),
            name,
            description,
            shotSize,
            shotType,
            cameraMovement,
            equipment,
            lens,
            customLens,
            lighting,
            depthOfField,
            frameRate,
            aspectRatio,
        };

        const film = films.find((f) => f.id === filmId);
        if (!film) return;

        const scene = film.scenes.find((s) => s.id === sceneId);
        if (!scene) return;

        if (shotId) {
            const shotIndex = scene.shots.findIndex((s) => s.id === shotId);
            if (shotIndex !== -1) {
                scene.shots[shotIndex] = shotData;
            }
        } else {
            scene.shots.push(shotData);
        }

        saveFilms();
        renderFilmDetail(filmId);
        closeModal(shotModal);
    };

    // Populate Shot Form for editing
    const populateShotForm = (filmId, sceneId, shotId) => {
        const film = films.find((f) => f.id === filmId);
        const scene = film ? film.scenes.find((s) => s.id === sceneId) : null;
        const shot = scene ? scene.shots.find((s) => s.id === shotId) : null;

        if (shot) {
            editShotIdInput.value = shot.id;
            shotModalFilmIdInput.value = filmId;
            shotModalSceneIdInput.value = sceneId;

            shotNameInput.value = shot.name || "";
            shotDescriptionInput.value = shot.description || "";
            shotSizeSelect.value = shot.shotSize || "";
            shotTypeSelect.value = shot.shotType || "";
            cameraMovementSelect.value = shot.cameraMovement || "";
            equipmentSelect.value = shot.equipment || "";
            lensSelect.value = shot.lens || "";

            if (shot.lens === "Custom") {
                customLensInput.value = shot.customLens || "";
                customLensInput.classList.remove("hidden");
            } else {
                customLensInput.classList.add("hidden");
                customLensInput.value = "";
            }

            document.querySelectorAll('#lightingOptions input[type="checkbox"]').forEach((checkbox) => {
                checkbox.checked = shot.lighting && shot.lighting.includes(checkbox.value);
            });

            depthOfFieldSelect.value = shot.depthOfField || "";
            frameRateSelect.value = shot.frameRate || "";
            aspectRatioSelect.value = shot.aspectRatio || "";

            shotModalTitle.textContent = "Edit Shot";
            saveShotBtn.textContent = "Update Shot";
            openModal(shotModal);
        }
    };

    // Delete Shot
    const deleteShot = (filmId, sceneId, shotId) => {
        if (confirm("Are you sure you want to delete this shot?")) {
            const film = films.find((f) => f.id === filmId);
            if (film) {
                const scene = film.scenes.find((s) => s.id === sceneId);
                if (scene) {
                    scene.shots = scene.shots.filter((shot) => shot.id !== shotId);
                    saveFilms();
                    renderFilmDetail(filmId);
                }
            }
        }
    };

    // --- Event Listeners (Static elements) ---

    // Initial Load
    loadFilms();
    renderDashboard();
    showView(dashboardView);

    // Create Film Button (Dashboard)
    createFilmBtn.addEventListener("click", () => {
        createFilmForm.reset();
        openModal(createFilmModal);
    });

    // Back to Dashboard Button (Film Detail View)
    backToDashboardBtn.addEventListener("click", () => {
        currentFilmId = null; // Clear current film context
        renderDashboard();
        showView(dashboardView);
    });

    // Add Scene Button (Film Detail View)
    addSceneBtn.addEventListener("click", () => {
        if (currentFilmId) {
            addSceneForm.reset();
            addSceneForm.dataset.mode = "add"; // Set mode for submission handler
            addSceneForm.dataset.filmId = currentFilmId; // Link to current film
            addSceneModal.querySelector(".modal-title").textContent = "Add New Scene";
            addSceneModal.querySelector('button[type="submit"]').textContent = "Add Scene";
            sceneNameInput.value = ""; // Clear previous name
            sceneDescriptionInput.value = ""; // Clear previous description
            openModal(addSceneModal);
        }
    });

    // Submit Create Film Form
    createFilmForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = filmNameInput.value.trim();
        const description = filmDescriptionInput.value.trim();
        if (name) {
            createFilm(name, description);
        } else {
            alert("Film title is required!");
        }
    });

    // Submit Add/Edit Scene Form
    addSceneForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const sceneName = sceneNameInput.value.trim();
        const sceneDescription = sceneDescriptionInput.value.trim();
        const mode = addSceneForm.dataset.mode;
        const filmId = addSceneForm.dataset.filmId;
        const sceneId = addSceneForm.dataset.sceneId;

        if (!sceneName) {
            alert("Scene name is required!");
            return;
        }

        if (mode === "add") {
            if (filmId) {
                addScene(filmId, sceneName, sceneDescription);
            }
        } else if (mode === "edit") {
            if (filmId && sceneId) {
                updateScene(filmId, sceneId, sceneName, sceneDescription);
            }
        }
    });

    // Add/Edit Shot Form Submission
    shotForm.addEventListener("submit", (e) => {
        e.preventDefault();
        addOrUpdateShot();
    });

    // Close Modal Buttons
    closeButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
            const modalId = e.target.dataset.modal;
            closeModal(document.getElementById(modalId));
        });
    });

    // Close modal when clicking outside content
    window.addEventListener("click", (e) => {
        if (e.target.classList.contains("modal")) {
            closeModal(e.target);
        }
    });

    // Handle Custom Lens Input Visibility
    lensSelect.addEventListener("change", () => {
        if (lensSelect.value === "Custom") {
            customLensInput.classList.remove("hidden");
            customLensInput.setAttribute("required", "true");
        } else {
            customLensInput.classList.add("hidden");
            customLensInput.removeAttribute("required");
            customLensInput.value = "";
        }
    });
});

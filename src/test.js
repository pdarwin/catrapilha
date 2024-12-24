/**
 * Enable a quick tool to move (or copy) a claim from one entity to another.
 * @author [[User:Matěj Suchánek]] (original author)
 * @author [[User:Melderick]] (property change gadget)
 * @todo MVC, OOUI/Vue
 */
(function (mw, $) {
  if (
    [0, 120, 146].indexOf(mw.config.get("wgNamespaceNumber")) === -1 ||
    !mw.config.exists("wbEntityId") ||
    !mw.config.get("wbIsEditView")
  ) {
    return;
  }

  mw.messages.set({
    "another-entity": "To another entity",
    "same-entity": "To the same entity",
    close: "Close",
    "copy-claim": "Copy claim",
    "move-claim": "Move claim",
    newentity: "The id of the new entity:",
    newproperty: "The id of the new property:",
    "force-label": "Allow type mismatch:",
    "move-claim-new": "NEW",
    "move-claim-intro":
      "You can move a claim to another entity. Please give a valid entity id.",
    "move-claim-intro-hint":
      'If you write "$1", you will copy/move the claim to a new item.',
    "move-claim-intro-same-entity":
      "You can move a claim to another property of the current entity.",
    "move-claim-intro-hint-same-entity":
      "Please give a valid property id and of the same type as the current property.",
    "move-claim-copied": "The claim $1 was copied to [[$2|$3]].",
    "move-claim-moved": "The claim $1 was moved to [[$2|$3]].",
    "error-sameid":
      "The new entity's id has to be different to the current one's.",
    "error-sameproperty":
      "The new property's id has to be different to the current one's.",
    "error-differenttype":
      "The current entity $1 and the new entity [[$2|$3]] has to be of the same type. Use the above checkbox to override this control.",
    "error-invalidid": "The given id is not a valid entity identifier.",
    "error-invalidproperty": "The given id is not a valid property identifier.",
    "error-invaliddatatype":
      "The new property is incompatible with the current property datatype.",
    "error-notexisting": "The entity with the id [[$1|$2]] does not exist.",
    "error-api": "There was an error editing the entity: $1",
  });
  switch (mw.config.get("wgUserLanguage")) {
    case "be-tarask":
      mw.messages.set({
        "another-entity": "Да іншай існасьці",
        "same-entity": "Да гэтай самай існасьці",
        close: "Зачыніць",
        "copy-claim": "Скапіяваць сьцьверджаньне",
        "move-claim": "Перанесьці сьцьверджаньне",
        newentity: "Ідэнтыфікатар новай існасьці:",
        newproperty: "Ідэнтыфікатар новай уласьцівасьці:",
        "force-label": "Дазволіць несупадзеньне тыпаў:",
        "move-claim-new": "НОВЫ",
        "move-claim-intro":
          "Сьцьверджаньне можна перанесьці ў іншую існасьць. Калі ласка, пазначце правільны ідэнтыфікатар існасьці.",
        "move-claim-intro-hint":
          "Увёўшы «$1», вы скапіюеце/перанесяцё сьцьверджаньне ў новы элемэнт.",
        "move-claim-intro-same-entity":
          "Можаце перанесьці сьцьверджаньне ў іншую ўласьцівасьць гэтай існасьці.",
        "move-claim-intro-hint-same-entity":
          "Калі ласка, падайце слушны ідэнтыфікатар уласьцівасьці і таго ж тыпу, што і цяперашняя.",
        "move-claim-copied": "Сьцьверджаньне $1 скапіяванае ў [[$2|$3]].",
        "move-claim-moved": "Сьцьверджаньне $1 перанесенае ў [[$2|$3]].",
        "error-sameid":
          "Ідэнтыфікатар новай існасьці мусіць адрозьнівацца ад цяперашняга.",
        "error-sameproperty":
          "Ідэнтыфікатар новай уласьцівасьці мусіць адрозьнівацца ад цяперашняга.",
        "error-differenttype":
          "Цяперашняя існасьць $1 і новая існасьць [[$2|$3]] мусяць быць аднаго тыпу. Каб зьмяніць гэты кантроль, пастаўце птушачку ўверсе.",
        "error-invalidid":
          "Уведзены ідэнтыфікатар — няслушны ідэнтыфікатар існасьці.",
        "error-invalidproperty":
          "Уведзены ідэнтыфікатар — няслушны ідэнтыфікатар уласьцівасьці.",
        "error-invaliddatatype":
          "Новая ўласьцівасьць несумяшчальная з тыпам зьвестак цяперашняй уласьцівасьці.",
        "error-notexisting": "Існасьці з ідэнтыфікатарам [[$1|$2]] не існуе.",
        "error-api": "Пры рэдагаваньні існасьці адбылася памылка: $1",
      });
      break;
    case "el":
      mw.messages.set({
        "another-entity": "Σε μια άλλη οντότητα",
        "same-entity": "Στην ίδια οντότητα",
        close: "Κλείσιμο",
        "copy-claim": "Αντιγραφή ισχυρισμού",
        "move-claim": "Μετακίνηση ισχυρισμού",
        newentity: "Το αναγνωριστικό (id) της νέας οντότητας:",
        newproperty: "Το αναγνωριστικό (id) της νέας οντότητας:",
        "move-claim-new": "ΝΕΟ",
        "move-claim-intro":
          "Μπορείτε να μετακινήσετε ένα ισχυρισμό σε μια άλλη οντότητα. Παρακαλώ δώστε έγκυρο αναγνωριστικό (id) οντότητας.",
        "move-claim-intro-hint":
          'Αν γράψετε "$1", θα αντιγράψει/μετακινήσει τον ισχυρισμό σε ένα νέο αντικείμενο.',
        "move-claim-intro-same-entity":
          "Μπορείτε να μετακινήσετε ένα ισχυρισμό σε μια άλλη ιδιότητα της παρούσας οντότητας.",
        "move-claim-intro-hint-same-entity":
          "Παρακαλώ δώστε ένα έγκυρο αναγνωριστικό (id) οντότητας και του ίδιου τύπου της παρούσας ιδιότητας.",
        "move-claim-copied":
          "Ο ισχυρισμός $1 αντιγράφτηκε στο αντικείμενο [[$2|$3]].",
        "move-claim-moved":
          "Ο ισχυρισμός $1 μετακινήθηκε στο αντικείμενο [[$2|$3]].",
        "error-sameid":
          "Το/τα αναγνωριστικό/ά (id) της νέας οντότητα/των νέων οντοτήτων πρέπει να είναι διαφορετικό/ά από το/τα τρέχον/τρέχοντα.",
        "error-sameproperty":
          "Η νέα ιδιότητα/οι νέες ιδιότητες πρέπει να είναι διαφορετική/διαφορετικές από την παρούσα/τις παρούσες.",
        "error-invalidid":
          "Το δοθέν αναγνωριστικό (id) δεν είναι ένα έγκυρο αναγνωριστικό οντότητας.",
        "error-invalidproperty":
          "Το δοθέν αναγνωριστικό (id) δεν είναι ένα έγκυρο αναγνωριστικό ιδιότητας.",
        "error-invaliddatatype":
          "Η νέα ιδιότητα είναι ασύμβατη με το είδος των δεδομένων της παρούσας ιδιότητας.",
        "error-notexisting":
          "Η οντότητα με αναγνωριστικό (id) [[$1|$2]] δεν υπάρχει.",
        "error-api":
          "Παρουσιάστηκε ένα σφάλμα στην επεξεργασία της οντότητας: $1",
      });
      break;
    case "fr":
      mw.messages.set({
        "another-entity": "Vers un autre élément",
        "same-entity": "Vers le même élément",
        close: "Fermer",
        "copy-claim": "Copier l’affirmation",
        "move-claim": "Déplacer l’affirmation",
        newentity: "Identifiant du nouvel élément :",
        newproperty: "Identifiant de la nouvelle propriété :",
        "force-label": "Autoriser un différent type d’élément:",
        "move-claim-new": "NOUVEAU",
        "move-claim-intro":
          "Vous pouvez déplacer cette affirmation vers un autre élément. Veuillez donner un identifiant d’élément valide.",
        "move-claim-intro-hint":
          'Si vous rentrez "$1", vous copierez/déplacerez l’affirmation vers un nouvel élément.',
        "move-claim-intro-same-entity":
          "Vous pouvez déplacer cette affirmation vers une autre propriété de l’élément courant.",
        "move-claim-intro-hint-same-entity":
          "Veuillez donner un identifiant de propriété valide et de même type que la propriété courante.",
        "move-claim-copied":
          "L’affirmation $1 a été copiée vers [[$2|$3]] avec succès.",
        "move-claim-moved":
          "L’affirmation $1 a été déplacée vers [[$2|$3]] avec succès.",
        "error-sameid":
          "L’identifiant du nouvel élément doit être différent de celui de l’élément actuel.",
        "error-sameproperty":
          "L’identifiant de la nouvelle propriété doit être différent de celui de la propriété actuelle.",
        "error-differenttype":
          "L’élément courant $1 et le nouvel élément [[$2|$3]] doivent être du même type. Cocher la case ci-dessous pour passer outre ce contrôle.",
        "error-invalidid":
          "L’identifiant donné n’est pas un identifiant d’élément valide.",
        "error-invalidproperty":
          "L’identifiant donné n’est pas un identifiant de propriété valide.",
        "error-invaliddatatype":
          "La nouvelle propriété est incompatible avec le datatype de la propriété actuelle.",
        "error-notexisting":
          "L’élément avec l’identifiant [[$1|$2]] n’existe pas.",
        "error-api":
          "Une erreur est survenue lors de l’édition de l’élément : $1",
      });
      break;
    case "it":
      mw.messages.set({
        close: "Chiudi",
        "copy-claim": "Copia dichiarazione",
        "move-claim": "Sposta dichiarazione",
        newentity: "L'ID della nuova entità:",
        "move-claim-new": "NUOVO",
        "move-claim-intro":
          "Puoi spostare una dichiarazione in un'altra entità. Inserisci un valido ID dell'entità.",
        "move-claim-intro-hint":
          'Se scrivi "$1", copierai/sposterai la dichiarazione in un nuovo elemento.',
        "move-claim-copied":
          "La dichiarazione $1 è stata copiata con successo in [[$2|$3]].",
        "move-claim-moved":
          "La dichiarazione $1 è stata spostata con successo in [[$2|$3]].",
        "error-sameid":
          "L'ID della nuova entità deve essere differente da quello attuale.",
        "error-invalidid": "L'ID inserito non è quello di una valida entità.",
        "error-notexisting": "L'entità con ID $1 non esiste.",
        "error-api": "C'è stato un errore nella modifica dell'entità: $1",
      });
      break;
    case "sv":
      mw.messages.set({
        "another-entity": "Till en annan entitet",
        "same-entity": "Till samma entitet",
        close: "Stäng",
        "copy-claim": "Kopiera påstående",
        "move-claim": "Flytta påstående",
        newentity: "Den nya entitetens ID:",
        newproperty: "Den nya egenskapens ID:",
        "force-label": "Tillåt typmatchningsfel:",
        "move-claim-new": "NY",
        "move-claim-intro":
          "Du kan flytta ett påstående till en annan entitet. Ange ett giltigt entitets-ID.",
        "move-claim-intro-hint":
          'Om du skriver "$1" kommer du flytta/kopiera påståendet till ett nytt objekt.',
        "move-claim-intro-same-entity":
          "Du kan flytta ett påstående till en annan egenskap hos den nuvarande entiteten.",
        "move-claim-intro-hint-same-entity":
          "Ange ett giltigt egenskaps-ID som är av samma typ som den nuvarande egenskapen.",
        "move-claim-copied": "Påståendet $1 kopierades till [[$2|$3]].",
        "move-claim-moved": "Påståendet $1 flyttades till [[$2|$3]].",
        "error-sameid":
          "Den nya entitetens ID måste skilja sig från den aktuella.",
        "error-sameproperty":
          "Den nya egenskapens ID måste skilja sig från den aktuella.",
        "error-differenttype":
          "Den aktuella entiteten $1 och den nya entiteten [[$2|$3]] måste vara av samma typ. Använd kryssrutan ovan för att åsidosätta denna kontroll.",
        "error-invalidid":
          "Det angivna ID:t är inte en giltig entitetsidentifierare.",
        "error-invalidproperty":
          "Det angivna ID:t är inte en giltig egenskapsidentifierare.",
        "error-invaliddatatype":
          "Den nya egenskapen är inte kompatibel med den aktuella egenskapens datatyp.",
        "error-notexisting": "Det finns ingen entitet med ID:t [[$1|$2]].",
        "error-api": "Det uppstod ett fel när entiteten redigerades: $1",
      });
      break;
  }

  var canEditThis = mw.config.get("wgIsProbablyEditable"),
    TO_ANOTHER_ENTITY = 0,
    TO_THE_SAME_ENTITY = 1,
    COPY_CLAIM = false,
    MOVE_CLAIM = true;

  var api,
    repoApi,
    claimid,
    oldentity,
    oldproperty,
    oldtitle,
    olddata = null,
    newentity,
    newproperty,
    newtitle,
    newdata,
    newdatatype,
    lastMode = canEditThis ? MOVE_CLAIM : COPY_CLAIM,
    lastTab = TO_ANOTHER_ENTITY,
    credit = "using [[MediaWiki:Gadget-moveClaim.js|moveClaim.js]]";

  function createSpinner() {
    $("#move-claim-result").html(
      $.createSpinner({
        size: "large",
        type: "block",
      })
    );
  }

  function showError(error) {
    var parameters = Array.prototype.slice.call(arguments, 1);
    $("#move-claim-result").html(
      $("<p>")
        .attr("class", "error")
        .html(
          mw
            .message("error-" + error)
            .params(parameters)
            .parse()
        )
    );
  }

  function onError(error, result) {
    showError("api", (result && result.error && result.error.info) || error);
  }

  function getFragmentedTitle(title, entity) {
    if (entity.indexOf("-") !== -1) {
      title = title.replace(/:.+$/, ":" + entity.replace("-", "#"));
    }
    return title;
  }

  function successProperty(removed) {
    var $statement = $(".wikibase-statement-" + $.escapeSelector(claimid)),
      message = mw.message(
        removed ? "move-claim-moved" : "move-claim-copied",
        oldproperty,
        "Property:" + newproperty,
        newproperty
      );

    $("#move-claim").dialog("close");

    // Todo: Hide moved claim
    if (removed) {
      $statement.find(".move-button-container").remove();
    }

    mw.notify(message, {
      title: removed ? mw.msg("move-claim") : mw.msg("copy-claim"),
    });
  }

  function success(removed) {
    var $statement = $(".wikibase-statement-" + $.escapeSelector(claimid)),
      message = mw.message(
        removed ? "move-claim-moved" : "move-claim-copied",
        oldproperty,
        newtitle,
        newentity
      );

    $("#move-claim").dialog("close");
    $("#move-newentity").val(newentity); // update for new items

    // Todo: Hide moved claim
    if (removed) {
      $statement.find(".move-button-container").remove();
    }

    mw.notify(message, {
      title: removed ? mw.msg("move-claim") : mw.msg("copy-claim"),
    });
  }

  function loadEntity() {
    if (olddata !== null) {
      return $.Deferred().resolve().promise();
    }
    return repoApi
      .getEntities(oldentity, ["info", "claims"])
      .then(function (data) {
        olddata = data.entities[oldentity];
        oldtitle = getFragmentedTitle(olddata.title, oldentity);
      });
  }

  function clone(data) {
    return JSON.parse(JSON.stringify(data));
  }

  function getQualifiersHash(claim) {
    var hashes = [];
    Object.values(claim.qualifiers || {}).forEach(function (qualifiers) {
      Array.prototype.push.apply(
        hashes,
        qualifiers.map(function (q) {
          return q.hash;
        })
      );
    });
    return hashes.sort().join("|");
  }

  function getHash(claim) {
    return claim.mainsnak.hash + "$" + getQualifiersHash(claim);
  }

  function getMainsnakForCmp(claim) {
    var mainsnak = clone(claim.mainsnak);
    delete mainsnak.hash;
    delete mainsnak.property;
    return JSON.stringify(mainsnak);
  }

  function mergePropertyClaim(claim, removing) {
    var data = {},
      mainsnak = getMainsnakForCmp(claim),
      hash = getQualifiersHash(claim),
      same = false;

    $.each(olddata.claims[newproperty] || [], function (i, _claim) {
      if (
        mainsnak === getMainsnakForCmp(_claim) &&
        hash === getQualifiersHash(_claim) &&
        lastTab !== TO_THE_SAME_ENTITY
      ) {
        same = _claim;
        return false;
      }
    });

    if (same !== false) {
      if (!claim.references) {
        return $.Deferred().resolve().promise();
      }
      data = clone(same);
      var hashes = (same.references || []).map(function (ref) {
        return ref.hash;
      });
      claim.references.forEach(function (ref) {
        if (hashes.indexOf(ref.hash) === -1) {
          if (data.references === undefined) {
            data.references = [];
          }
          data.references.push(ref);
        }
      });
    } else {
      data = clone(claim);
      data.mainsnak.property = newproperty;
      delete data.mainsnak.hash;
      delete data.id;
    }

    var post = { claims: [data] };
    if (removing) {
      post.claims.push({ id: claimid, remove: 1 });
    }

    return api.postWithEditToken({
      formatversion: 2,
      action: "wbeditentity",
      id: oldentity,
      data: JSON.stringify(post),
      baserevid: olddata.lastrevid,
      summary: removing
        ? "Moving [[Property:" +
          oldproperty +
          "]] to [[Property:" +
          newproperty +
          "]], " +
          credit
        : "Copying [[Property:" +
          oldproperty +
          "]] to [[Property:" +
          newproperty +
          "]], " +
          credit,
    });
  }

  function mergeClaim(claim, removing) {
    var property = claim.mainsnak.property;
    var data = {},
      hash = getHash(claim),
      same = false;
    $.each(newdata.claims[property] || [], function (_, _claim) {
      if (hash === getHash(_claim)) {
        same = _claim;
        return false;
      }
    });

    if (same !== false) {
      if (!claim.references) {
        return $.Deferred().resolve().promise();
      }
      data = clone(same);
      var hashes = (same.references || []).map(function (ref) {
        return ref.hash;
      });
      claim.references.forEach(function (ref) {
        if (hashes.indexOf(ref.hash) === -1) {
          if (data.references === undefined) {
            data.references = [];
          }
          data.references.push(ref);
        }
      });
    } else {
      data = clone(claim);
      delete data.id;
    }

    return api.postWithEditToken({
      formatversion: 2,
      action: "wbeditentity",
      id: newentity,
      data: JSON.stringify({ claims: [data] }),
      baserevid: newdata.lastrevid,
      summary: removing
        ? "Moving [[Property:" +
          property +
          "]] from [[" +
          oldtitle +
          "]], " +
          credit
        : "Copying [[Property:" +
          property +
          "]] from [[" +
          oldtitle +
          "]], " +
          credit,
    });
  }

  function getAllClaims() {
    var claims = [];
    Object.values(olddata.claims || {}).forEach(function (p_claims) {
      Array.prototype.push.apply(claims, p_claims);
    });
    return claims;
  }

  function moveProperty(remove) {
    var claim = false;
    $.each(getAllClaims(), function (_, _claim) {
      if (_claim.id === claimid) {
        claim = _claim;
        return false;
      }
    });

    if (!claim) {
      return false;
    }

    if (newdatatype !== claim.mainsnak.datatype) {
      showError("invaliddatatype");
      return false;
    }

    return mergePropertyClaim(claim, remove);
  }

  function move(remove) {
    var claim = false;
    $.each(getAllClaims(), function (_, _claim) {
      if (_claim.id === claimid) {
        claim = _claim;
        return false;
      }
    });
    if (!claim) return false;

    return mergeClaim(claim, remove).then(function () {
      if (!remove) {
        return;
      }
      return api.postWithEditToken({
        action: "wbremoveclaims",
        baserevid: olddata.lastrevid,
        claim: claimid,
        formatversion: 2,
        summary: "Moving claim to [[" + newtitle + "]], " + credit,
      });
    });
  }

  function performPropertyChange(remove) {
    createSpinner();
    newproperty = $("#move-newproperty").val().toUpperCase();

    // if ( oldproperty === newproperty ) {
    // 	showError( 'sameproperty' );
    // 	return;
    // }
    if (newproperty.match(/^P[1-9]\d*$/) === null) {
      showError("invalidproperty");
      return;
    }

    repoApi
      .getEntities([oldentity, newproperty], ["info", "claims"])
      .then(function (data) {
        var entity = data.entities[newproperty];
        if (entity.hasOwnProperty("missing")) {
          showError("notexisting", "Property:" + newproperty, newproperty);
          return false;
        }

        olddata = data.entities[oldentity];
        newdatatype = entity.datatype;

        return moveProperty(remove);
      })
      .then(function (ok) {
        if (ok === false) {
          return;
        }
        successProperty(remove);
      }, onError);
  }

  function performMove(remove) {
    lastMode = remove;
    lastTab = $("#move-claim").tabs("option", "active");
    if (lastTab === TO_THE_SAME_ENTITY) {
      performPropertyChange(remove);
      return;
    }
    createSpinner();
    newentity = $("#move-newentity").val().toUpperCase();
    if (oldentity === newentity) {
      showError("sameid");
      return;
    }

    var promise;
    if (["NEW", mw.msg("move-claim-new")].indexOf(newentity) !== -1) {
      promise = $.when(
        repoApi
          .createEntity("item") // todo: lexemes (upstream)
          .then(function (data) {
            newdata = data.entity;
            newentity = newdata.id;
            newtitle = newentity; // todo: getFragmentedTitle( newdata.title, newentity );

            return true;
          }),
        loadEntity()
      );
    } else {
      if (
        newentity.match(/^([PQ][1-9]\d*|L[1-9]\d*(-[FS][1-9]\d*)?)$/) === null
      ) {
        if (oldentity.charAt(0) === "L" && newentity.match(/^[FS][1-9]\d*$/)) {
          newentity = oldentity + "-" + newentity;
        } else {
          showError("invalidid");
          return;
        }
      }
      if (
        $("#force-checkbox").is(":checked") === false &&
        newentity.charAt(0) === "P" &&
        oldentity.charAt(0) !== "P"
      ) {
        $("#force-group").show();
        showError(
          "differenttype",
          oldentity,
          "Property:" + newentity,
          newentity
        );
        return;
      }
      promise = repoApi
        .getEntities([oldentity, newentity], ["info", "claims"])
        .then(function (data) {
          var entity = data.entities[newentity];
          if (entity.hasOwnProperty("missing")) {
            showError("notexisting", newentity, newentity);
            return false;
          }

          if (entity.hasOwnProperty("redirects")) {
            newentity = entity.redirects.to;
          }

          olddata = data.entities[oldentity];
          newdata = entity;

          oldtitle = getFragmentedTitle(olddata.title, oldentity);
          newtitle = getFragmentedTitle(newdata.title, newentity);

          return true;
        });
    }

    promise.then(function (ok) {
      if (ok === false) return;
      ok = move(remove);
      if (ok === false) return;
      return ok.then(function () {
        success(remove);
      });
    }, onError);
  }

  function openDialog() {
    $("#move-claim-result").empty();
    $("#force-group").hide();
    $("#force-checkbox").prop("checked", false);
    $("#move-claim").dialog("open");
    $("#move-claim").tabs("option", "active", lastTab);
    if (
      (lastTab === TO_ANOTHER_ENTITY && $("#move-newentity").val() !== "") ||
      (lastTab === TO_THE_SAME_ENTITY && $("#move-newproperty").val() !== "")
    ) {
      if (lastMode === MOVE_CLAIM) {
        $("#move-claim-button-move").focus();
      } else {
        $("#move-claim-button-copy").focus();
      }
    }
  }

  function addButton($statement) {
    $statement.prepend(
      $("<div>")
        .attr("class", "move-button-container")
        .css({
          float: "right",
          position: "relative",
          "z-index": 1,
        })
        .append(
          $("<a>")
            .attr({
              href: "#",
              class: "move-button",
            })
            .on("click", function (event) {
              event.preventDefault();
              claimid = $statement.attr("id");
              oldentity = claimid.split("$")[0].toUpperCase();
              oldproperty = $statement
                .closest(".wikibase-statementgroupview")
                .attr("id");
              openDialog();
            })
        )
    );
  }

  function removeIf(buttons, idx, remove) {
    if (remove) {
      buttons.shift(idx);
    }
    return buttons;
  }

  function init() {
    // Add click listener
    $(".wikibase-statementview").each(function () {
      addButton($(this));
    });

    // Create dialog
    $("<div>")
      .attr("id", "move-claim")
      .append(
        $("<ul>").append(
          $("<li>").append(
            $("<a>")
              .attr("href", canEditThis ? "#another-entity" : "#")
              .append($("<span>").text(mw.msg("another-entity")))
          ),
          $("<li>").append(
            $("<a>")
              .attr("href", "#same-entity")
              .append($("<span>").text(mw.msg("same-entity")))
          )
        ),
        $("<div>")
          .attr("id", "another-entity")
          .append(
            $("<form>")
              .submit(function (event) {
                event.preventDefault();
                performMove(lastMode);
              })
              .append(
                $("<fieldset>").append(
                  $("<legend>").text(mw.msg("move-claim")),
                  // </legend>
                  $("<p>")
                    .attr("id", "claim-intro")
                    .text(mw.msg("move-claim-intro")),
                  // </p>
                  $("<p>")
                    .attr("id", "claim-intro-hint")
                    .text(
                      mw
                        .msg("move-claim-intro-hint")
                        .replace("$1", mw.msg("move-claim-new"))
                    ),
                  // </p>
                  $("<p>").append(
                    $("<label>")
                      .attr({
                        for: "move-newentity",
                        class: "move-label",
                      })
                      .text(mw.msg("newentity")),
                    // </label>
                    " ",
                    $("<input>")
                      .attr({
                        type: "text",
                        id: "move-newentity",
                        class: "move-input",
                      })
                      .on("keyup", function () {
                        this.value = this.value.replace(
                          /.*([PQ][1-9]\d*).*/,
                          "$1"
                        ); // TODO: lexemes etc.
                      })
                    // </label>
                  ),
                  // </p>
                  $("<p>")
                    .attr({
                      id: "force-group",
                    })
                    .append(
                      $("<label>")
                        .attr({
                          for: "move-newentity",
                          class: "move-label",
                        })
                        .text(mw.msg("force-label")),
                      " ",
                      // </label>
                      $("<input>").attr({
                        type: "checkbox",
                        id: "force-checkbox",
                      })
                    )
                ) // </p>
              ) // </fieldset>
            // </form>
          ),
        $("<div>")
          .attr("id", "same-entity")
          .append(
            $("<form>")
              .submit(function (event) {
                event.preventDefault();
                performMove(lastMode);
              })
              .append(
                $("<fieldset>").append(
                  $("<legend>").text(mw.msg("move-claim")),
                  // </legend>
                  $("<p>")
                    .attr("id", "claim-intro-same-entity")
                    .text(mw.msg("move-claim-intro-same-entity")),
                  // </p>
                  $("<p>")
                    .attr("id", "claim-intro-hint-same-entity")
                    .text(mw.msg("move-claim-intro-hint-same-entity")),
                  // </p>
                  $("<p>").append(
                    $("<label>")
                      .attr({
                        for: "move-newproperty",
                        class: "move-label",
                      })
                      .text(mw.msg("newproperty")),
                    " ",
                    // </label>
                    $("<input>")
                      .attr({
                        type: "text",
                        id: "move-newproperty",
                        class: "move-input",
                      })
                      .on("keyup", function () {
                        this.value = this.value.replace(
                          /.*(P[1-9]\d*).*/,
                          "$1"
                        );
                      })
                  )
                ) // </p>
              ) // </fieldset>
            // </form>
          ),
        $("<p>").attr("id", "move-claim-result")
      )
      .dialog({
        dialogClass: "move-dialog",
        title: mw.message("move-claim").escaped(),
        autoOpen: false,
        modal: true,
        width: 500,
        buttons: removeIf(
          [
            {
              id: "move-claim-button-move",
              text: mw.msg("move-claim"),
              click: function (event) {
                event.preventDefault();
                performMove(MOVE_CLAIM);
              },
            },
            {
              id: "move-claim-button-copy",
              text: mw.msg("copy-claim"),
              click: function (event) {
                event.preventDefault();
                performMove(COPY_CLAIM);
              },
            },
            {
              id: "move-claim-button-close",
              text: mw.msg("close"),
              click: function (event) {
                event.preventDefault();
                $("#move-claim").dialog("close");
              },
            },
          ],
          0,
          !canEditThis
        ),
      });
    $("#move-claim").tabs();
  }

  if (mw.loader.getState("ext.gadget.Move") !== "ready") {
    // don't load CSS twice
    mw.loader.load(
      "//www.wikidata.org/w/index.php?title=MediaWiki:Gadget-Move.css&action=raw&ctype=text/css",
      "text/css"
    );
  }

  $.when(
    mw.loader
      .using([
        "jquery.spinner",
        "jquery.ui",
        "mediawiki.api",
        "mediawiki.util",
        "wikibase.api.RepoApi",
        "wikibase.Site",
      ])
      .then(function () {
        api = new mw.Api();
        repoApi = new wikibase.api.RepoApi(api);
      }),
    $.ready
  ).then(init);

  mw.hook("wikibase.statement.saved").add(function (_, guid) {
    olddata = null;
    //var $block = $( '#' + $.escapeSelector( guid ) );
    var $block = $(".wikibase-statement-" + $.escapeSelector(guid));
    if ($block.find(".move-button-container").length === 0) {
      addButton($block);
    }
  });
})(mediaWiki, jQuery);

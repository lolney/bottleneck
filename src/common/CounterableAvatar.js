import DynamicObject from 'lance/serialize/DynamicObject';
import { getSiegeItemFromId } from '../config';

// If subtypes between too unwieldy, could consider remking as a behavior
// But prefer this for now, since many of these need to be methods
export default class CounterableAvatar extends DynamicObject {
    syncTo(other) {
        if (
            this.attachedSiegeItemId == null &&
            other.attachedSiegeItemId != null &&
            this.actor
        ) {
            console.log(
                `Syncing new attachedSiegeItemId: ${other.attachedSiegeItemId}`
            );
            this.attachSiegeItemSprite(other.attachedSiegeItemId);
        }
        super.syncTo(other);
        this.attachedSiegeItemId = other.attachedSiegeItemId;
    }

    attachSiegeItemSprite(siegeItemId, name) {
        this.actor.setLoading(false);

        const siegeItem = getSiegeItemFromId(siegeItemId);
        name = name == undefined ? siegeItem.name : name;

        this.actor.compositeSprite(name);
    }

    isCountered() {
        return this.attachedSiegeItemId != null;
    }

    attachCounter(siegeItemId) {
        if (this.attachedSiegeItemId != null) {
            throw new Error(
                `Cannot attach siege item: ${
                    this.attachedSiegeItemId
                } is already attached`
            );
        }
        this.attachedSiegeItemId = siegeItemId;
    }

    setLoading(id) {
        if (id) {
            this.actor.setLoading(true, getSiegeItemFromId(id).name);
        } else {
            this.actor.setLoading(false);
        }
    }
}

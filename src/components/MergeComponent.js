import { useDataEngine, useDataQuery } from '@dhis2/app-runtime';
import {
	Button,
	ButtonStrip,
	DataTable,
	DataTableBody,
	DataTableCell,
	DataTableColumnHeader,
	DataTableRow,
	Modal,
	ModalActions,
	ModalContent,
	Radio,
	TableHead
} from '@dhis2/ui'
import React, { useEffect, useState } from 'react'
import classes from '../App.module.css';


const MergeComponent = ({setMergeAction, selectedMergingItems}) => {
	const engine = useDataEngine()

	const [attributes, setAttributes] = useState([]);
	const [enrollmentAttributes, setEnrollmentAttributes] = useState([]);
	const [events, setEvents] = useState([]);
	const [child, setChild] = useState(null);
	const [parent, setParent] = useState(null);
	const [dataElements, setDataElements] = useState([]);
	const [programStages, setProgramStages] = useState([]);
	const [uids, setUids] = useState('');
	const [stageIds, setStageIds] = useState('');
	const [relationships, setRelationships] = useState([]);

	const trackerMutation = {
		resource: 'tracker',
		type: 'update',
		data: ({payload}) => ({
			payload
		})
	}

	const dataElementsQuery = {
		dataElements: {
			resource: 'dataElements',
			params: ({uids}) => ({
				fields: 'name, id',
				filter: `id:in:${uids}`
			})
		},
		programStages: {
			resource: 'programStages',
			params: ({stageIds}) => ({
				fields: 'name, id',
				filter: `id:in:${stageIds}`
			})
		}
	}

	const {data: queryResult, refetch: refetch} = useDataQuery(dataElementsQuery, {variables: {uids, stageIds}})

	const childTrackedEntity = {
		trackedEntity: {
			resource: `tracker/trackedEntities/${selectedMergingItems.tei_child}`,
			params: ({
				fields: "*"
			}),
		},
	}
	const {
		data: childEntity,
	} = useDataQuery(childTrackedEntity, {variables: {id: selectedMergingItems.tei_child}})

	const parentTrackedEntity = {
		trackedEntity: {
			resource: `tracker/trackedEntities/${selectedMergingItems.tei_parent}`,
			params: ({
				fields: "*"
			}),
		},
	}
	const {
		data: parentEntity,
	} = useDataQuery(parentTrackedEntity, {variables: {id: selectedMergingItems.tei_parent}})

	useEffect(() => {
		refetch({uids, stageIds});
		if (queryResult) {
			setDataElements(queryResult.dataElements.dataElements);
			setProgramStages(queryResult.programStages.programStages)

		}
	}, [uids, dataElements])

	useEffect(() => {
		if (childEntity && parentEntity) {
			setParent(parentEntity.trackedEntity);
			setChild(childEntity.trackedEntity);

			const de = [];
			const stages = [];
			parentEntity.trackedEntity.enrollments[0].events.forEach(evt => {
				if (!stages.includes(evt.programStage)) {
					stages.push(evt.programStage)
				}
				evt.dataValues.forEach(dv => {
					if (!de.includes(dv.dataElement)) {
						de.push(dv.dataElement);
					}
				})
			})

			childEntity.trackedEntity.enrollments[0].events.forEach(evt => {
				if (!stages.includes(evt.programStage)) {
					stages.push(evt.programStage)
				}
				evt.dataValues.forEach(dv => {
					if (!de.includes(dv.dataElement)) {
						de.push(dv.dataElement);
					}
				})
			})

			//Set up default selections
			setEvents(parentEntity.trackedEntity.enrollments[0].events);
			setAttributes(parentEntity.trackedEntity.attributes)
			setEnrollmentAttributes(parentEntity.trackedEntity.enrollments[0].attributes)
			setRelationships(parentEntity.trackedEntity.relationships)

			setUids(`[${de.join(',')}]`)
			setStageIds(`[${stages.join(',')}]`)
		}

	}, [parentEntity, childEntity])

	const sortedEvent = (events) => {
		events = events || []
		events.sort((e1, e2) => e1.programStage.localeCompare(e2.programStage))
		return events;
	}

	const sortedDataValues = (values) => {
		values = values || []
		values.sort((e1, e2) => e1.dataElement.localeCompare(e2.dataElement))
		return values;
	}

	const sortedAttributes = (attributes) => {
		attributes = attributes || []
		attributes.sort((e1, e2) => e1.attribute.localeCompare(e2.attribute))
		return attributes;
	}

	const sortedRelationships  = (relationships) => {
		relationships = relationships || []
		relationships.sort((e1, e2) => e1.relationship.localeCompare(e2.relationship))
		return relationships;
	}

	const selectAttribute = (attribute, type) => {
		if (type === 'enrollment') {
			setEnrollmentAttributes(() => {
				const filtered = enrollmentAttributes.filter(attr => attr.attribute !== attribute.attribute)
				filtered.push(attribute);
				return filtered;
			})
		} else {
			setAttributes(() => {
				const filtered = attributes.filter(attr => attr.attribute !== attribute.attribute)
				filtered.push(attribute);
				return filtered;
			})
		}
	}

	const selectDataValue = (event, dataValue) => {
		setEvents(() => {
			event = {...(events.find(evt => evt.programStage === event.programStage) || event)};
			const filtered = events.filter(evt => evt.programStage !== event.programStage);
			const dataValues = event.dataValues.filter(dv => dv.dataElement !== dataValue.dataElement);
			dataValues.push(dataValue);
			event.dataValues = dataValues;
			filtered.push(event);
			return filtered;
		})
	}

	const selectRelationship = (relationship) => {
		setRelationships(() => {
			const filtered = relationships.filter(rel => rel.relationship !== relationship.relationship)
			filtered.push(relationship);
			return filtered;
		})
	}

	const mergeEntities = () => {
		const entity = parentEntity.trackedEntity;

		//Filter for selected entity attributes
		let filteredAttributes = entity.attributes.filter(attr => !attributes.find(a => a.attribute === attr.attribute));
		filteredAttributes.push(...attributes)
		entity.attributes = filteredAttributes;

		//Filter for selected enrollment attributes
		filteredAttributes = entity.enrollments[0].attributes.filter(attr => !enrollmentAttributes.find(a => a.attribute === attr.attribute));
		filteredAttributes.push(...enrollmentAttributes);
		entity.enrollments[0].attributes = filteredAttributes;

		//Add selected data values
		const filteredEvents = entity.enrollments[0].events.filter(evt => !events.find(e => e.event === evt.event))
		filteredEvents.push(...events);
		entity.enrollments[0].events = filteredEvents;

		//Add selected relationship merging
		const filteredRelationships = entity.relationships.filter(rel => !relationships.find(a => a.relationship === rel.relationship));
		filteredRelationships.push(...relationships)
		entity.relationships = filteredRelationships;

		const payload = {
			trackedEntities: [
				entity,
				{
					trackedEntity: childEntity.trackedEntity.trackedEntity,
					inactive: true
				}
			]
		};

		engine.mutate(trackerMutation, {variables: {payload}})
	}

	return (<>
		<Modal large>
			<ModalContent>
				<DataTable className={`${classes.dataTableMargin}`}>
					<TableHead large={true}>
						<DataTableRow>
							<DataTableColumnHeader fixed top="0">
								Parent Entity
							</DataTableColumnHeader>
							<DataTableColumnHeader fixed top="0">
								Child Entity
							</DataTableColumnHeader>
						</DataTableRow>
					</TableHead>
					<DataTableBody>
						<DataTableRow>
							<DataTableCell colSpan={2}>
								Attributes
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedAttributes(parent?.attributes).map(attr => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															{attr ? attr.displayName : ''}
														</DataTableCell>
														<DataTableCell>
															{attr ? attr.value : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={attributes.find(a => attr.id === a.id && attr.value === a.value)}
																onChange={() => selectAttribute(attr, 'entity')}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedAttributes(child?.attributes).map(attr => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															{attr ? attr.displayName : ''}
														</DataTableCell>
														<DataTableCell>
															{attr ? attr.value : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={attributes.find(a => attr.id === a.id && attr.value === a.value)}
																onChange={() => selectAttribute(attr, 'entity')}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell colSpan={2}>
								Enrollment Attributes
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedAttributes(parent?.enrollments[0]?.attributes).map(attr => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															{attr ? attr.displayName : ''}
														</DataTableCell>
														<DataTableCell>
															{attr ? attr.value : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={enrollmentAttributes.find(a => attr.id === a.id && attr.value === a.value)}
																onChange={() => selectAttribute(attr, 'enrollment')}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedAttributes(child?.enrollments[0]?.attributes).map(attr => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															{attr ? attr.displayName : ''}
														</DataTableCell>
														<DataTableCell>
															{attr ? attr.value : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={enrollmentAttributes.find(a => attr.id === a.id && attr.value === a.value)}
																onChange={() => selectAttribute(attr, 'enrollment')}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell colSpan={2}>
								Events
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedEvent(parent?.enrollments[0].events).map(evt => {
											return (
												<>
													<DataTableRow>
														<DataTable>
															<DataTableBody>
																<DataTableRow>
																	<DataTableCell>
																		Program stage
																	</DataTableCell>
																	<DataTableCell>
																		{programStages.find(ps => ps.id === evt.programStage)?.name}
																	</DataTableCell>
																</DataTableRow>
																<DataTableRow>
																	<DataTableCell>
																		Event status
																	</DataTableCell>
																	<DataTableCell>
																		{evt.status}
																	</DataTableCell>
																</DataTableRow>
																<DataTableRow>
																	<DataTableCell colSpan={2}>
																		Data values
																	</DataTableCell>
																</DataTableRow>
																{sortedDataValues(evt.dataValues).map(dv => {
																	return (
																		<>
																			<DataTableRow>
																				<DataTableCell>
																					Data Element
																				</DataTableCell>
																				<DataTableCell colSpan={2}>
																					{dataElements.find(de => de.id === dv.dataElement)?.name}
																				</DataTableCell>
																			</DataTableRow>
																			<DataTableRow>
																				<DataTableCell>
																					Value
																				</DataTableCell>
																				<DataTableCell>
																					{dv.value}
																				</DataTableCell>
																				<DataTableCell>
																					<Radio
																						checked={events.find(a => evt.programStage === a.programStage)?.dataValues.find(v => dv.dataElement === v.dataElement && dv.value === v.value)}
																						onChange={() => selectDataValue(evt, dv)}/>
																				</DataTableCell>
																			</DataTableRow>
																		</>
																	)
																})}
															</DataTableBody>
														</DataTable>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedEvent(child?.enrollments[0].events).map(evt => {
											return (
												<>
													<DataTableRow>
														<DataTable>
															<DataTableBody>
																<DataTableRow>
																	<DataTableCell>
																		Program stage
																	</DataTableCell>
																	<DataTableCell>
																		{programStages.find(ps => ps.id === evt.programStage)?.name}
																	</DataTableCell>
																</DataTableRow>
																<DataTableRow>
																	<DataTableCell>
																		Event status
																	</DataTableCell>
																	<DataTableCell>
																		{evt.status}
																	</DataTableCell>
																</DataTableRow>
																<DataTableRow>
																	<DataTableCell colSpan={2}>
																		Data values
																	</DataTableCell>
																</DataTableRow>
																{sortedDataValues(evt.dataValues).map(dv => {
																	return (
																		<>
																			<DataTableRow>
																				<DataTableCell>
																					Data Element
																				</DataTableCell>
																				<DataTableCell colSpan={2}>
																					{dataElements.find(de => de.id === dv.dataElement)?.name}
																				</DataTableCell>
																			</DataTableRow>
																			<DataTableRow>
																				<DataTableCell>
																					Value
																				</DataTableCell>
																				<DataTableCell>
																					{dv.value}
																				</DataTableCell>
																				<DataTableCell>
																					<Radio
																						checked={events.find(a => evt.programStage === a.programStage)?.dataValues.find(v => dv.dataElement === v.dataElement && dv.value === v.value)}
																						onChange={() => selectDataValue(evt, dv)}/>
																				</DataTableCell>
																			</DataTableRow>
																		</>
																	)
																})}
															</DataTableBody>
														</DataTable>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell colSpan={2}>
								Relationships
							</DataTableCell>
						</DataTableRow>
						<DataTableRow>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedRelationships(parent?.relationships).map(rel => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															Name
														</DataTableCell>
														<DataTableCell>
															{rel ? rel.relationshipName : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={relationships.find(a => rel.from === a.from && rel.to === a.to && rel.relationshipName === a.relationshipName)}
																onChange={() => selectRelationship(rel)}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
							<DataTableCell>
								<DataTable>
									<DataTableBody>
										{sortedRelationships(child?.relationships).map(rel => {
											return (
												<>
													<DataTableRow>
														<DataTableCell>
															Name
														</DataTableCell>
														<DataTableCell>
															{rel ? rel.relationshipName : ''}
														</DataTableCell>
														<DataTableCell>
															<Radio
																checked={relationships.find(a => rel.from === a.from && rel.to === a.to && rel.relationshipName === a.relationshipName)}
																onChange={() => selectRelationship(rel)}/>
														</DataTableCell>
													</DataTableRow>
												</>
											);
										})}
									</DataTableBody>
								</DataTable>
							</DataTableCell>
						</DataTableRow>
					</DataTableBody>
				</DataTable>
			</ModalContent>
			<ModalActions>
				<ButtonStrip end>
					<Button onClick={() => setMergeAction(false)}>Cancel</Button>
					<Button
						primary
						onClick={mergeEntities}
					>
						Merge
					</Button>
				</ButtonStrip>
			</ModalActions>
		</Modal>
	</>)
}

export default MergeComponent